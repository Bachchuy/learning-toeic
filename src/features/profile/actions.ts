"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  validateDisplayName,
  validateTargetScore,
  validateDeleteConfirmation,
  buildUserExportJson,
  type UserExportPayload,
} from "@/core/profile";
import type {
  UserProfileData,
  ProfileActionResult,
  ExportDataResult,
} from "./types";

/**
 * Server Action: Lấy thông tin hồ sơ của người dùng hiện tại
 */
export async function getProfileAction(): Promise<{
  profile: UserProfileData | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, error: "Chưa đăng nhập" };
  }

  const { data: profileRow, error } = await supabase
    .from("profiles")
    .select("id, display_name, target_score, role, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (error || !profileRow) {
    return {
      profile: null,
      error: error?.message || "Không tìm thấy hồ sơ người dùng.",
    };
  }

  const profile: UserProfileData = {
    id: profileRow.id,
    email: user.email || "",
    displayName: profileRow.display_name || user.email?.split("@")[0] || "Học viên",
    targetScore: profileRow.target_score ?? 650,
    role: (profileRow.role as "student" | "admin") || "student",
    createdAt: profileRow.created_at,
    updatedAt: profileRow.updated_at,
  };

  return { profile };
}

/**
 * Server Action: Cập nhật thông tin hồ sơ (Tên hiển thị & Điểm mục tiêu)
 * BẤT BIẾN §4.1: Tuyệt đối không cho phép tự sửa `role`.
 */
export async function updateProfileAction(
  displayName: string,
  targetScore: number | string
): Promise<ProfileActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  // 1. Kiểm tra tính hợp lệ của tên hiển thị
  const nameValidation = validateDisplayName(displayName);
  if (!nameValidation.valid) {
    return { success: false, error: nameValidation.error };
  }

  // 2. Kiểm tra tính hợp lệ của điểm mục tiêu (10 - 990)
  const scoreValidation = validateTargetScore(targetScore);
  if (!scoreValidation.valid || scoreValidation.validatedScore === undefined) {
    return { success: false, error: scoreValidation.error };
  }

  // 3. Cập nhật bảng profiles (RLS: profiles_update_own)
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: nameValidation.cleaned,
      target_score: scoreValidation.validatedScore,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: "Không thể lưu thay đổi hồ sơ: " + error.message,
    };
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Đã cập nhật thông tin hồ sơ thành công.",
  };
}

/**
 * Server Action: Xuất toàn bộ dữ liệu cá nhân dạng JSON (Data Portability)
 * Bao gồm hồ sơ, sổ từ vựng, thẻ ôn tập FSRS và lịch sử làm bài.
 */
export async function exportUserDataAction(): Promise<ExportDataResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Chưa đăng nhập." };
  }

  try {
    // 1. Lấy thông tin hồ sơ
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // 2. Lấy sổ từ vựng
    const { data: vocabList } = await supabase
      .from("vocab_entries")
      .select("word, pos, meaning, context_sentence, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // 3. Lấy thẻ FSRS
    const { data: reviewCards } = await supabase
      .from("review_cards")
      .select("id, state, stability, difficulty, due, reps, lapses")
      .eq("user_id", user.id);

    // 4. Lấy lịch sử attempts gần nhất
    const { data: attempts } = await supabase
      .from("attempts")
      .select("question_id, tag_id, is_correct, answered_at")
      .eq("user_id", user.id)
      .order("answered_at", { ascending: false })
      .limit(500);

    const payload: UserExportPayload = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      profile: {
        id: user.id,
        email: user.email || "",
        displayName: profile?.display_name || "",
        targetScore: profile?.target_score ?? 650,
        role: profile?.role || "student",
        createdAt: profile?.created_at || user.created_at,
      },
      summary: {
        totalVocab: vocabList?.length || 0,
        totalAttempts: attempts?.length || 0,
        totalCards: reviewCards?.length || 0,
      },
      vocabList: (vocabList || []).map((v) => ({
        word: v.word,
        pos: v.pos || undefined,
        meaning: v.meaning,
        contextSentence: v.context_sentence || undefined,
        savedAt: v.created_at,
      })),
      reviewCards: (reviewCards || []).map((c) => ({
        cardId: c.id,
        state: c.state,
        stability: c.stability,
        difficulty: c.difficulty,
        due: c.due,
        reps: c.reps,
        lapses: c.lapses,
      })),
      recentAttempts: (attempts || []).map((a) => ({
        questionId: a.question_id,
        tagId: a.tag_id,
        isCorrect: a.is_correct,
        answeredAt: a.answered_at,
      })),
    };

    const jsonData = buildUserExportJson(payload);
    const dateFormatted = new Date().toISOString().split("T")[0];
    const filename = `toeic-ai-data-${dateFormatted}.json`;

    return {
      success: true,
      jsonData,
      filename,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định khi xuất dữ liệu";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Xóa tài khoản vĩnh viễn (D-17)
 * - Yêu cầu gõ chính xác "XOA"
 * - Sử dụng Supabase Admin Client với quyền Service Role ở SERVER
 * - Xóa user ở auth.users -> Tự động kích hoạt CASCADE xóa profiles, attempts, vocab, review_cards...
 * - Đăng xuất người dùng sau khi xóa
 */
export async function deleteAccountAction(
  confirmation: string
): Promise<{ success: boolean; error?: string }> {
  if (!validateDeleteConfirmation(confirmation)) {
    return {
      success: false,
      error: "Mã xác nhận không đúng. Vui lòng gõ chính xác 'XOA' để tiếp tục.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Không tìm thấy phiên đăng nhập." };
  }

  try {
    // Gọi Supabase Service Role Admin Client ở phía Server (D-17 & §6.7)
    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return {
        success: false,
        error: "Không thể xóa tài khoản lúc này: " + deleteError.message,
      };
    }

    // Đăng xuất phiên hiện tại
    await supabase.auth.signOut();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi máy chủ khi xóa tài khoản";
    return { success: false, error: msg };
  }

  revalidatePath("/", "layout");
  redirect("/login?deleted=true");
}
