"use client";

import { useActionState, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  loginAction,
  signupAction,
  requestPasswordResetAction,
  signInWithGoogleAction,
  type AuthState,
} from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { CheckCircle2, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

function AuthStatusBanners() {
  const searchParams = useSearchParams();
  const isDeleted = searchParams.get("deleted") === "true";
  const isResetSuccess = searchParams.get("reset") === "success";
  const isCallbackError = searchParams.get("error") === "callback";

  return (
    <>
      {isDeleted && (
        <div
          role="status"
          className="p-3 mb-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#047857] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#047857]" aria-hidden="true" />
          <span>Tài khoản của bạn đã được xóa thành công cùng toàn bộ dữ liệu.</span>
        </div>
      )}
      {isResetSuccess && (
        <div
          role="status"
          className="p-3 mb-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#047857] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#047857]" aria-hidden="true" />
          <span>Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.</span>
        </div>
      )}
      {isCallbackError && (
        <div
          role="alert"
          className="p-3 mb-4 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-medium text-[#BE123C] flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-[#BE123C]" aria-hidden="true" />
          <span>Liên kết xác thực đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.</span>
        </div>
      )}
    </>
  );
}

function AuthFormInner() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, loginFormAction, isLoginPending] = useActionState(
    loginAction,
    {} as AuthState
  );

  const [signupState, signupFormAction, isSignupPending] = useActionState(
    signupAction,
    {} as AuthState
  );

  const [forgotState, forgotFormAction, isForgotPending] = useActionState(
    requestPasswordResetAction,
    {} as AuthState
  );

  const [googleState, googleFormAction, isGooglePending] = useActionState(
    signInWithGoogleAction,
    {} as AuthState
  );

  const currentState =
    mode === "login"
      ? loginState
      : mode === "signup"
        ? signupState
        : forgotState;
  const errorAlert = currentState?.error || googleState?.error;
  const isPending =
    mode === "login"
      ? isLoginPending
      : mode === "signup"
        ? isSignupPending
        : isForgotPending;

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <BrandLogo variant="vertical" size="lg" className="mb-2" priority />
        <h1 className="sr-only">Tôi Yêu Em Íc — Nền tảng luyện thi TOEIC thích ứng</h1>
      </div>

      <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle>
            {mode === "login"
              ? "Chào mừng bạn trở lại"
              : mode === "signup"
                ? "Tạo tài khoản mới"
                : "Khôi phục mật khẩu"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Đăng nhập để tiếp tục lộ trình ôn tập thích ứng"
              : mode === "signup"
                ? "Bắt đầu hành trình chinh phục mục tiêu TOEIC của bạn"
                : "Nhập email tài khoản để nhận liên kết đặt lại mật khẩu"}
          </CardDescription>

          {/* Mode Switcher Tabs — chuẩn a11y role="tablist", vùng chạm tối thiểu 44px */}
          {mode !== "forgot" && (
            <div
              role="tablist"
              aria-label="Chế độ xác thực"
              className="flex rounded-lg bg-[#F1F5F9] p-1 mt-4 border border-[#E2E8F0]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => setMode("login")}
                className={`flex-1 min-h-[44px] py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => setMode("signup")}
                className={`flex-1 min-h-[44px] py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                Đăng ký
              </button>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          <AuthStatusBanners />

          {/* Error Alert */}
          {errorAlert && (
            <div
              role="alert"
              className="p-3.5 mb-4 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-medium text-[#BE123C] flex items-center gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#BE123C]" aria-hidden="true" />
              <span>{errorAlert}</span>
            </div>
          )}

          {/* Success Alert */}
          {currentState?.success && (
            <div
              role="alert"
              className="p-3.5 mb-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#047857] flex items-center gap-2.5 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#047857]" aria-hidden="true" />
              <span>{currentState.success}</span>
            </div>
          )}

          <form
            action={
              mode === "login"
                ? loginFormAction
                : mode === "signup"
                  ? signupFormAction
                  : forgotFormAction
            }
            className="space-y-4"
          >
            {/* Trường ẩn chuyển hướng an toàn */}
            <input type="hidden" name="next" value={nextUrl} />

            {mode === "signup" && (
              <Input
                label="Họ và tên"
                name="fullName"
                type="text"
                placeholder="Linh Trần"
                autoComplete="name"
                disabled={isPending}
              />
            )}

            <Input
              label="Địa chỉ Email"
              name="email"
              type="email"
              placeholder="linh.tran@example.com"
              autoComplete="email"
              required
              disabled={isPending}
            />

            {mode !== "forgot" && (
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    label="Mật khẩu"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                    disabled={isPending}
                    className="pr-12"
                    hint={
                      mode === "signup" ? "Tối thiểu 8 ký tự" : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute right-0.5 top-[22px] h-11 min-w-[44px] inline-flex items-center justify-center text-[#475569] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="min-h-[44px] inline-flex items-center px-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bất biến: Duy nhất 1 nút Primary trên màn hình */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="cta"
                className="w-full"
                isLoading={isPending}
              >
                {mode === "login"
                  ? "Đăng nhập"
                  : mode === "signup"
                    ? "Tạo tài khoản"
                    : "Gửi liên kết đặt lại mật khẩu"}
              </Button>
            </div>

            {mode === "forgot" && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-xs font-medium text-[#475569] hover:text-[#0F172A] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Quay lại đăng nhập</span>
                </button>
              </div>
            )}
          </form>

          {mode !== "forgot" && (
            <div className="mt-5 space-y-4">
              <div className="relative flex items-center">
                <div className="grow border-t border-[#E2E8F0]" />
                <span className="shrink-0 px-3 text-[11px] font-medium uppercase tracking-wider text-[#475569]">
                  Hoặc tiếp tục với
                </span>
                <div className="grow border-t border-[#E2E8F0]" />
              </div>

              <form action={googleFormAction}>
                <input type="hidden" name="next" value={nextUrl} />
                <Button
                  type="submit"
                  variant="secondary"
                  size="cta"
                  className="w-full min-h-[44px]"
                  disabled={isPending || isGooglePending}
                  isLoading={isGooglePending}
                >
                  {!isGooglePending && (
                    <svg
                      className="w-[18px] h-[18px] shrink-0"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                      />
                    </svg>
                  )}
                  <span>Tiếp tục với Google</span>
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-[11px] text-[#475569] text-center mt-4 space-y-1.5 leading-relaxed">
        <p>
          TOEIC® là nhãn hiệu đã đăng ký của ETS. Tôi Yêu Em Íc là nền tảng luyện thi độc lập.
        </p>
        <p className="flex items-center justify-center gap-2">
          <Link href="/terms" className="text-[#2563EB] hover:underline">
            Điều khoản sử dụng
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="text-[#2563EB] hover:underline">
            Chính sách bảo mật
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-[#F8FAFC]">
      <Suspense fallback={<div className="text-sm text-slate-500">Đang tải...</div>}>
        <AuthFormInner />
      </Suspense>
    </div>
  );
}
