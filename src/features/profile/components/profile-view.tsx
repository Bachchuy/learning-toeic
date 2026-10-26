"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import { updateProfileAction, exportUserDataAction, deleteAccountAction } from "../actions";
import type { UserProfileData } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  User,
  Shield,
  Download,
  LogOut,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ProfileViewProps {
  initialProfile: UserProfileData;
}

export function ProfileView({ initialProfile }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfileData>(initialProfile);
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [targetScore, setTargetScore] = useState(initialProfile.targetScore.toString());

  // Trạng thái lưu hồ sơ
  const [isUpdating, startUpdateTransition] = useTransition();
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);
  const [updateErrorMsg, setUpdateErrorMsg] = useState<string | null>(null);

  // Trạng thái xuất dữ liệu
  const [isExporting, setIsExporting] = useState(false);
  const [exportErrorMsg, setExportErrorMsg] = useState<string | null>(null);

  // Trạng thái modal xóa tài khoản
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // Kiểm tra điểm mục tiêu hợp lệ tại client
  const targetScoreNum = parseInt(targetScore.trim(), 10);
  const isTargetScoreValid =
    !isNaN(targetScoreNum) && targetScoreNum >= 10 && targetScoreNum <= 990;

  // Xử lý Lưu thông tin hồ sơ
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccessMsg(null);
    setUpdateErrorMsg(null);

    if (!isTargetScoreValid) {
      setUpdateErrorMsg("Điểm mục tiêu phải nằm trong khoảng từ 10 đến 990 điểm.");
      return;
    }

    startUpdateTransition(async () => {
      const res = await updateProfileAction(displayName, targetScoreNum);
      if (res.success) {
        setUpdateSuccessMsg(res.message || "Đã lưu thay đổi thành công.");
        setProfile((prev) => ({
          ...prev,
          displayName: displayName.trim() || "Học viên",
          targetScore: targetScoreNum,
        }));
      } else {
        setUpdateErrorMsg(res.error || "Không thể cập nhật hồ sơ.");
      }
    });
  };

  // Xử lý Xuất dữ liệu JSON
  const handleExportData = async () => {
    setIsExporting(true);
    setExportErrorMsg(null);

    try {
      const res = await exportUserDataAction();
      if (!res.success || !res.jsonData) {
        setExportErrorMsg(res.error || "Không thể xuất dữ liệu.");
        return;
      }

      // Tạo Blob và kích hoạt tải về tệp tin JSON
      const blob = new Blob([res.jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || "toeic-ai-data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo tệp tải về.";
      setExportErrorMsg(message);
    } finally {
      setIsExporting(false);
    }
  };

  // Xử lý Xóa tài khoản vĩnh viễn
  const handleDeleteAccount = () => {
    setDeleteErrorMsg(null);
    startDeleteTransition(async () => {
      const res = await deleteAccountAction(deleteConfirmationText);
      if (!res.success) {
        setDeleteErrorMsg(res.error || "Không thể xóa tài khoản.");
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* ========================================================
          Tiêu đề trang
          ======================================================== */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Hồ sơ cá nhân
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Quản lý thông tin học tập, điểm mục tiêu và quyền riêng tư dữ liệu cá nhân.
        </p>
      </div>

      {/* ========================================================
          Thẻ 1: Thông tin tài khoản & Điểm mục tiêu (CTA Chính duy nhất)
          ======================================================== */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              <User className="w-5 h-5 text-[#2563EB]" />
              Thông tin học viên
            </CardTitle>
            <Badge variant="neutral" showIcon={false} className="text-xs font-mono">
              <Shield className="w-3 h-3 mr-1 text-[#475569]" />
              {profile.role === "admin" ? "Quản trị viên" : "Học viên"}
            </Badge>
          </div>
          <CardDescription className="text-xs text-[#475569]">
            Cập nhật tên hiển thị và điểm số mục tiêu để lộ trình thích ứng đề xuất phù hợp.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Tên hiển thị */}
            <Input
              id="display-name"
              label="Tên hiển thị"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder="Nhập tên hiển thị của bạn"
              disabled={isUpdating}
            />

            {/* Điểm mục tiêu TOEIC (10 - 990) */}
            <Input
              id="target-score"
              label="Điểm mục tiêu TOEIC"
              type="number"
              min={10}
              max={990}
              step={5}
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              disabled={isUpdating}
              hint="Thang điểm chuẩn từ 10 đến 990 điểm"
              error={
                !isTargetScoreValid && targetScore.trim() !== ""
                  ? "Điểm mục tiêu phải nằm trong khoảng 10 - 990"
                  : undefined
              }
            />

            {/* Email tài khoản (Chỉ đọc) */}
            <Input
              id="user-email"
              label="Email đăng nhập"
              type="email"
              value={profile.email}
              disabled
              readOnly
              hint="Email được bảo vệ và xác thực qua Supabase Auth"
            />

            {/* Thông báo cập nhật */}
            {updateSuccessMsg && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs font-medium text-[#047857] flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                <span>{updateSuccessMsg}</span>
              </div>
            )}

            {updateErrorMsg && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs font-medium text-[#BE123C] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-[#BE123C] shrink-0" />
                <span>{updateErrorMsg}</span>
              </div>
            )}

            {/* CTA Chính duy nhất: Lưu thay đổi (48px) */}
            <Button
              type="submit"
              variant="primary"
              size="cta"
              disabled={isUpdating || !isTargetScoreValid}
              isLoading={isUpdating}
              className="w-full"
            >
              Lưu thay đổi
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ========================================================
          Thẻ Dành riêng cho Quản trị viên (Admin Portal)
          ======================================================== */}
      {profile.role === "admin" && (
        <Card className="border-[#BFDBFE] bg-[#EFF6FF]/40 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#1E40AF] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#2563EB]" />
                Khu vực Quản trị viên
              </CardTitle>
              <Badge variant="neutral" showIcon={false} className="text-xs font-mono text-[#2563EB] bg-white border-[#BFDBFE]">
                ADMIN
              </Badge>
            </div>
            <CardDescription className="text-xs text-[#334155]">
              Bạn đang đăng nhập với quyền quản trị. Truy cập hàng đợi duyệt đề thi để kiểm định chất lượng và xuất bản câu hỏi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/review">
              <Button
                type="button"
                variant="secondary"
                className="w-full border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Mở Hàng đợi duyệt đề (/admin/review)
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ========================================================
          Thẻ 2: Dữ liệu cá nhân (Data Ownership)
          ======================================================== */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <Download className="w-5 h-5 text-[#2563EB]" />
            Dữ liệu học tập cá nhân
          </CardTitle>
          <CardDescription className="text-xs text-[#475569]">
            Bạn hoàn toàn làm chủ dữ liệu của mình. Tải về bản sao lưu đầy đủ gồm sổ từ vựng, thẻ FSRS và lịch sử làm bài dưới dạng tệp tin JSON.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {exportErrorMsg && (
            <p className="text-xs text-[#BE123C] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {exportErrorMsg}
            </p>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={handleExportData}
            disabled={isExporting}
            isLoading={isExporting}
            className="w-full"
          >
            <Download className="w-4 h-4 text-[#475569]" />
            Xuất dữ liệu JSON
          </Button>
        </CardContent>
      </Card>

      {/* ========================================================
          Thẻ 3: Phiên đăng nhập
          ======================================================== */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <LogOut className="w-5 h-5 text-[#475569]" />
            Phiên đăng nhập
          </CardTitle>
          <CardDescription className="text-xs text-[#475569]">
            Đăng xuất khỏi tài khoản trên thiết bị này. Dữ liệu học tập và chuỗi ngày của bạn vẫn được lưu trữ an toàn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="secondary"
              className="w-full"
            >
              <LogOut className="w-4 h-4 text-[#475569]" />
              Đăng xuất
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ========================================================
          Thẻ 4: Vùng nguy hiểm (Danger Zone) — Xóa tài khoản (D-17)
          ======================================================== */}
      <Card className="border-[#FECDD3] bg-[#FFF1F2]/20 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#BE123C] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#BE123C]" />
            Vùng nguy hiểm
          </CardTitle>
          <CardDescription className="text-xs text-[#475569]">
            Thao tác này sẽ xóa vĩnh viễn tài khoản và toàn bộ dữ liệu học tập liên quan. Sau khi thực hiện, hành động này không thể hoàn tác.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setDeleteConfirmationText("");
              setDeleteErrorMsg(null);
              setIsDeleteModalOpen(true);
            }}
            className="w-full"
          >
            <AlertTriangle className="w-4 h-4 text-[#BE123C]" />
            Xóa tài khoản vĩnh viễn
          </Button>
        </CardContent>
      </Card>

      {/* ========================================================
          Confirmation Modal xóa tài khoản (D-17)
          ======================================================== */}
      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-xl shadow-xl border border-[#E2E8F0] max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-[#BE123C]">
                <div className="p-2 rounded-lg bg-[#FFF1F2]">
                  <AlertTriangle className="w-5 h-5 text-[#BE123C]" />
                </div>
                <h2 id="delete-dialog-title" className="text-lg font-bold text-[#0F172A]">
                  Xác nhận xóa tài khoản
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-[#475569] hover:text-[#0F172A] p-1 rounded-md"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản không? Hành động này sẽ xóa vĩnh viễn:
            </p>

            <ul className="text-xs space-y-1.5 text-[#475569] bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
              <li className="flex items-center gap-1.5">
                <span className="text-[#BE123C] font-bold">•</span>
                Hồ sơ học viên và mục tiêu cá nhân
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#BE123C] font-bold">•</span>
                Toàn bộ sổ từ vựng và thẻ nhớ FSRS
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#BE123C] font-bold">•</span>
                Lịch sử làm bài và thống kê độ vững Wilson
              </li>
            </ul>

            <Input
              id="confirm-delete-input"
              label="Nhập XOA để xác nhận thao tác xóa vĩnh viễn"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value.toUpperCase())}
              placeholder="XOA"
              autoComplete="off"
              disabled={isDeleting}
              className="font-mono uppercase text-center tracking-widest text-base"
            />

            {deleteErrorMsg && (
              <div
                role="alert"
                className="p-2.5 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs text-[#BE123C] flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteErrorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  deleteConfirmationText.trim().toUpperCase() !== "XOA" || isDeleting
                }
                isLoading={isDeleting}
                onClick={handleDeleteAccount}
              >
                Xóa vĩnh viễn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
