import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin, getReviewQueueAction } from "@/features/admin/actions";
import { AdminReviewView } from "@/features/admin/components/admin-review-view";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hàng đợi duyệt đề (Admin Review) | TOEIC",
  description: "Duyệt và kiểm định chất lượng câu hỏi TOEIC trước khi phát hành.",
};

export default async function AdminReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/review");
  }

  // BẤT BIẾN §4.9 & §6.3: Kiểm tra quyền Admin (role = admin)
  const { isAdmin } = await checkIsAdmin();

  if (!isAdmin) {
    // Trạng thái Lỗi phân quyền (docs/05-design/states-copy.md §5.10)
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center mx-auto text-[#BE123C]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#0F172A]">
              Không có quyền truy cập (403 Forbidden)
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              Trang hàng đợi duyệt câu hỏi chỉ dành riêng cho tài khoản Quản trị viên (Admin). Tài khoản hiện tại của bạn không được phân quyền này.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/">
              <Button variant="secondary" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tải danh sách câu hỏi cần duyệt
  const { questions, error } = await getReviewQueueAction();

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-sm text-[#BE123C]">
          {error}
        </div>
        <Link href="/">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
          </Button>
        </Link>
      </div>
    );
  }

  return <AdminReviewView initialQuestions={questions} />;
}
