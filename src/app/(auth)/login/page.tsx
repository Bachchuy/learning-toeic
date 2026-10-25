"use client";

import { useActionState, useState } from "react";
import { loginAction, signupAction, type AuthState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2563EB] text-white font-bold text-xl mb-3 shadow-none">
            T
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            TOEIC AI Platform
          </h1>
          <p className="text-sm text-[#475569] mt-1 font-mono">
            Precision Swiss LearningGrid
          </p>
        </div>

        <Card className="p-6">
          <CardHeader className="text-center pb-2">
            <CardTitle>
              {mode === "login" ? "Chào mừng bạn trở lại" : "Tạo tài khoản mới"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Đăng nhập để tiếp tục lộ trình ôn tập thích ứng FSRS"
                : "Bắt đầu hành trình chinh phục mục tiêu TOEIC của bạn"}
            </CardDescription>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-lg bg-[#F1F5F9] p-1 mt-4 border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  mode === "login"
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  mode === "signup"
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                Đăng ký
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Error Alert */}
            {currentState?.error && (
              <div
                role="alert"
                className="p-3 mb-4 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-medium text-[#BE123C] flex items-center gap-2"
              >
                <span className="font-bold select-none">[!]</span>
                <span>{currentState.error}</span>
              </div>
            )}

            {/* Success Alert */}
            {currentState?.success && (
              <div
                role="alert"
                className="p-3 mb-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#047857] flex items-center gap-2"
              >
                <span className="font-bold select-none">[✓]</span>
                <span>{currentState.success}</span>
              </div>
            )}

            <form
              action={mode === "login" ? loginFormAction : signupFormAction}
              className="space-y-4"
            >
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

              <Input
                label="Mật khẩu"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                disabled={isPending}
                hint={
                  mode === "signup" ? "Tối thiểu 6 ký tự" : undefined
                }
              />

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
    </div>
  );
}
