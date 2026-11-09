import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client chạy ở Server Components, Server Actions và Route Handlers.
 * Tự động quản lý và đồng bộ Session JWT thông qua Cookies.
 * Memoized per-request bằng React cache() để tránh khởi tạo lại nhiều lần trong cùng request.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createServerClient(
    supabaseUrl,
    supabaseKey,
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
});
