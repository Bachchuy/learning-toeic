"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

export interface AuthState {
  error?: string;
  success?: string;
}

const FIFTEEN_MINUTES_MS = 15 * 60_000;

function sanitizeInternalNext(nextParam: string | null): string {
  if (
    typeof nextParam === "string" &&
    nextParam.startsWith("/") &&
    !nextParam.startsWith("//") &&
    !nextParam.startsWith("/\\")
  ) {
    return nextParam;
  }
  return "/";
}

async function resolveClientKey(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = headerStore.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

async function resolveAppOrigin(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "http";
  if (host) {
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
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

  const normalizedEmail = email.trim().toLowerCase();
  const rl = checkRateLimit(`auth:login:${normalizedEmail}`, {
    limit: 10,
    windowMs: FIFTEEN_MINUTES_MS,
  });
  if (!rl.allowed) {
    return {
      error: `Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ${rl.retryAfterSeconds} giây.`,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    // Copy tiếng Việt chuẩn: docs/05-design/states-copy.md §5.11
    return { error: "Email hoặc mật khẩu không đúng" };
  }

  // Chuyển hướng về trang đích an toàn (ngăn Open Redirect)
  const redirectTo = sanitizeInternalNext(nextParam);

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

  const normalizedEmail = email.trim().toLowerCase();
  const rl = checkRateLimit(`auth:signup:${normalizedEmail}`, {
    limit: 5,
    windowMs: FIFTEEN_MINUTES_MS,
  });
  if (!rl.allowed) {
    return {
      error: `Bạn gửi yêu cầu tạo tài khoản quá nhanh. Vui lòng thử lại sau ${rl.retryAfterSeconds} giây.`,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
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

  const redirectTo = sanitizeInternalNext(nextParam);

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

/**
 * Server Action khởi tạo luồng đăng nhập OAuth với Google
 */
export async function signInWithGoogleAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nextParam = formData.get("next") as string | null;
  const safeNext = sanitizeInternalNext(nextParam);
  const clientIp = await resolveClientKey();

  const rl = checkRateLimit(`auth:oauth:google:${clientIp}`, {
    limit: 20,
    windowMs: FIFTEEN_MINUTES_MS,
  });
  if (!rl.allowed) {
    return {
      error: `Bạn gửi yêu cầu đăng nhập Google quá nhanh. Vui lòng thử lại sau ${rl.retryAfterSeconds} giây.`,
    };
  }

  let oauthUrl: string | null = null;
  try {
    const supabase = await createClient();
    const origin = await resolveAppOrigin();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });
    if (!error && data?.url) {
      oauthUrl = data.url;
    }
  } catch (err) {
    console.error("[signInWithGoogleAction] Error:", err);
  }

  if (!oauthUrl) {
    return {
      error:
        "Đăng nhập bằng Google hiện chưa được kích hoạt hoặc gặp lỗi cấu hình. Vui lòng đăng nhập bằng Email và mật khẩu.",
    };
  }

  redirect(oauthUrl);
}

/**
 * Server Action gửi email đặt lại mật khẩu (chống dò email theo chuẩn M1)
 */
export async function requestPasswordResetAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string | null)?.trim() || "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Vui lòng nhập địa chỉ email hợp lệ." };
  }

  const normalizedEmail = email.toLowerCase();
  const rl = checkRateLimit(`auth:reset:${normalizedEmail}`, {
    limit: 3,
    windowMs: FIFTEEN_MINUTES_MS,
  });
  if (!rl.allowed) {
    return {
      error: `Bạn đã yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau ${rl.retryAfterSeconds} giây.`,
    };
  }

  try {
    const supabase = await createClient();
    const origin = await resolveAppOrigin();
    await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
  } catch (err) {
    console.error("[requestPasswordResetAction] Error:", err);
  }

  return {
    success:
      "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu. Vui lòng kiểm tra hòm thư (kể cả mục Spam).",
  };
}

/**
 * Server Action cập nhật mật khẩu mới sau khi người dùng mở liên kết khôi phục
 */
export async function updatePasswordAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = (formData.get("password") as string | null) || "";
  const confirmPassword = (formData.get("confirmPassword") as string | null) || "";

  if (password.length < 8) {
    return { error: "Mật khẩu mới phải có độ dài tối thiểu 8 ký tự" };
  }

  if (password !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu liên kết mới.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("different")) {
      return { error: "Mật khẩu mới không được trùng với mật khẩu hiện tại." };
    }
    return { error: "Không thể cập nhật mật khẩu lúc này. Vui lòng thử lại." };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?reset=success");
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
