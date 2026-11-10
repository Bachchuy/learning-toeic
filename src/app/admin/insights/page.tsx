import Link from "next/link";
import { requireUser } from "@/shared/auth";
import { checkIsAdmin } from "@/features/admin/actions";
import { getAdminInsightsAction } from "@/features/feedback/actions";
import { AdminInsightsView } from "@/features/admin/components/admin-insights-view";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Insights & Góp ý",
  description:
    "Theo dõi độ dày kho đề, phễu sử dụng thực tế và hộp thư góp ý từ người học.",
};

export default async function AdminInsightsPage() {
  await requireUser({ redirectTo: "/admin/insights" });

  const { isAdmin } = await checkIsAdmin();
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center mx-auto text-[#BE123C]">
            <ShieldAlert className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#0F172A]">
              Không có quyền truy cập (403 Forbidden)
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              Trang thống kê vận hành chỉ dành riêng cho tài khoản Quản trị viên (Admin).
            </p>
          </div>
          <div className="pt-2">
            <Link href="/">
              <Button variant="secondary" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Quay lại Trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data, error } = await getAdminInsightsAction();
  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-sm text-[#BE123C]">
          {error || "Không thể tải dữ liệu thống kê."}
        </div>
        <Link href="/">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Quay lại Trang chủ
          </Button>
        </Link>
      </div>
    );
  }

  return <AdminInsightsView initialData={data} />;
}
