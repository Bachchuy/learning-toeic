import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileAction } from "@/features/profile/actions";
import { ProfileView } from "@/features/profile/components/profile-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hồ sơ cá nhân | TOEIC AI",
  description: "Quản lý thông tin học tập, điểm mục tiêu và quyền riêng tư dữ liệu cá nhân.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const { profile, error } = await getProfileAction();

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="p-4 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-sm text-[#BE123C] mb-4">
          {error || "Không thể tải hồ sơ người dùng."}
        </div>
        <p className="text-xs text-[#475569]">
          Vui lòng thử đăng nhập lại hoặc liên hệ quản trị viên nếu sự cố tiếp diễn.
        </p>
      </div>
    );
  }

  return <ProfileView initialProfile={profile} />;
}
