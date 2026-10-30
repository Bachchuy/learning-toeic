"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, signupAction, type AuthState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

function DeletedBanner() {
  const searchParams = useSearchParams();
  const isDeleted = searchParams.get("deleted") === "true";
  if (!isDeleted) return null;
  return (
    <div
      role="status"
      className="p-3 mb-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#047857] flex items-center gap-2"
    >
      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#047857]" aria-hidden="true" />
      <span>Tài khoản của bạn đã được xóa thành công cùng toàn bộ dữ liệu.</span>
    </div>
  );
}

function AuthFormInner() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, loginFormAction, isLoginPending] = useActionState(
    loginAction,
    {} as AuthState
  );

  const [signupState, signupFormAction, isSignupPending] = useActionState(
    signupAction,
    {} as AuthState
  );

  const currentState = mode === "login" ? loginState : signupState;
  const isPending = mode === "login" ? isLoginPending : isSignupPending;

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <BrandLogo variant="vertical" size="lg" className="mb-2" priority />
        <h1 className="sr-only">Tôi Em Íc — Nền tảng luyện thi TOEIC thích ứng</h1>
      </div>

      <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle>
            {mode === "login" ? "Chào mừng bạn trở lại" : "Tạo tài khoản mới"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Đăng nhập để tiếp tục lộ trình ôn tập thích ứng"
              : "Bắt đầu hành trình chinh phục mục tiêu TOEIC của bạn"}
          </CardDescription>

          {/* Mode Switcher Tabs — chuẩn a11y role="tablist", vùng chạm tối thiểu 44px */}
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
        </CardHeader>

        <CardContent className="pt-4">
          <DeletedBanner />

          {/* Error Alert */}
          {currentState?.error && (
            <div
              role="alert"
              className="p-3.5 mb-4 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-medium text-[#BE123C] flex items-center gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#BE123C]" aria-hidden="true" />
              <span>{currentState.error}</span>
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
            action={mode === "login" ? loginFormAction : signupFormAction}
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
                hint={
                  mode === "signup" ? "Tối thiểu 8 ký tự" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Bất biến: Duy nhất 1 nút Primary trên màn hình */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="cta"
                className="w-full"
                isLoading={isPending}
              >
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
