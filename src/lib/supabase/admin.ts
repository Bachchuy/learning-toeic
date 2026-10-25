import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client với quyền Service Role (BỎ QUA RLS).
 * 
 * BẤT BIẾN BẢO MẬT §6.1 & §6.7:
 * - CHỈ dùng trong Server Actions đặc quyền (như xóa tài khoản) hoặc Admin scripts.
 * - TUYỆT ĐỐI không import vào mã client.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "LỖI BẢO MẬT NGHIÊM TRỌNG: Không bao giờ được phép gọi Supabase Admin Client ở phía Client!"
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
