import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client chạy ở Server Components, Server Actions và Route Handlers.
 * Tự động quản lý và đồng bộ Session JWT thông qua Cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Lỗi setAll khi gọi từ Server Component thuần có thể bỏ qua
            // vì middleware đã chịu trách nhiệm làm mới session.
          }
        },
      },
    }
  );
}
