"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { updatePasswordAction, type AuthState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    {} as AuthState
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <BrandLogo variant="vertical" size="lg" className="mb-2" priority />
          <h1 className="sr-only">Đặt lại mật khẩu tài khoản Tôi Yêu Em Íc</h1>
        </div>

        <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle>Thiết lập mật khẩu mới</CardTitle>
            <CardDescription>
              Nhập mật khẩu mới (tối thiểu 8 ký tự) để hoàn tất khôi phục tài
              khoản
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {state?.error && (
              <div
                role="alert"
                className="p-3.5 mb-4 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-medium text-[#BE123C] flex items-center gap-2.5 animate-in fade-in"
              >
                <AlertCircle
                  className="w-4 h-4 shrink-0 text-[#BE123C]"
                  aria-hidden="true"
                />
                <span>{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="relative">
                <Input
                  label="Mật khẩu mới"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={isPending}
                  className="pr-12"
                  hint="Tối thiểu 8 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                  className="absolute right-0.5 top-[22px] h-11 min-w-[44px] inline-flex items-center justify-center text-[#475569] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={isPending}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={
                    showConfirm
                      ? "Ẩn xác nhận mật khẩu"
                      : "Hiện xác nhận mật khẩu"
                  }
                  className="absolute right-0.5 top-[22px] h-11 min-w-[44px] inline-flex items-center justify-center text-[#475569] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="cta"
                  className="w-full"
                  isLoading={isPending}
                >
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>

            <div className="pt-4 mt-4 border-t border-[#E2E8F0] text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-xs font-medium text-[#475569] hover:text-[#0F172A] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Quay lại trang đăng nhập</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
