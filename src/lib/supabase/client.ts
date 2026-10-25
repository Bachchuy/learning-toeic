import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client chạy ở phía Trình duyệt (Browser Client).
 * Dùng cho các thao tác Auth phía client (nếu có) hoặc các tương tác thời gian thực.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
