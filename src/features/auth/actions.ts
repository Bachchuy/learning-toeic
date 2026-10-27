"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  success?: string;
}

/**
 * Server Action xử lý Đăng nhập Email + Mật khẩu
 */
export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextParam = formData.get("next") as string | null;

  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Copy tiếng Việt chuẩn: docs/05-design/states-copy.md §5.11
    return { error: "Email hoặc mật khẩu không đúng" };
  }

  // Chuyển hướng về trang đích an toàn (ngăn Open Redirect)
  let redirectTo = "/";
  if (typeof nextParam === "string" && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
    redirectTo = nextParam;
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

/**
 * Server Action xử lý Đăng ký tài khoản mới
 */
export async function signupAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const nextParam = formData.get("next") as string | null;

  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu" };
  }

  if (password.length < 8) {
    return { error: "Mật khẩu phải có độ dài tối thiểu 8 ký tự" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || split_email(email),
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return { error: "Email này đã được đăng ký tài khoản. Vui lòng chọn Đăng nhập." };
    }
    if (msg.includes("invalid email")) {
      return { error: "Địa chỉ email không đúng định dạng." };
    }
    return { error: "Không thể tạo tài khoản lúc này. Vui lòng thử lại sau." };
  }

  // Nếu Supabase bật confirm email
  if (data?.user && !data.session) {
    return {
      success:
        "Đăng ký thành công! Vui lòng kiểm tra hòm thư email để xác nhận tài khoản.",
    };
  }

  let redirectTo = "/";
  if (typeof nextParam === "string" && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
    redirectTo = nextParam;
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

/**
 * Server Action Đăng xuất
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

function split_email(email: string): string {
  return email.split("@")[0] || "Học viên";
}
