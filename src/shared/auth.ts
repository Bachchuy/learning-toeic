import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export class UnauthorizedError extends Error {
  constructor(message: string = "Vui lòng đăng nhập để tiếp tục") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Lấy thông tin người dùng hiện tại một cách an toàn (tùy chọn).
 * Không gây lỗi hay redirect nếu người dùng chưa đăng nhập (khách vãng lai).
 * Được memoize bằng React cache() để tránh gọi lặp lại Supabase auth server
 * nhiều lần trong cùng một chu kỳ request / render trang.
 */
export const getOptionalUser = cache(async (): Promise<{
  user: User | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabase };
});

/**
 * Yêu cầu người dùng phải đăng nhập trước khi thực thi.
 * - Khi gọi trong Server Page: Tự động chuyển hướng về /login?next=...
 * - Khi gọi trong Server Action: Ném ngoại lệ UnauthorizedError chuẩn nếu throwIfAction = true
 */
export async function requireUser(options?: {
  redirectTo?: string;
  throwIfAction?: boolean;
}): Promise<{
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  const { user, supabase } = await getOptionalUser();

  if (!user) {
    if (options?.throwIfAction) {
      throw new UnauthorizedError();
    }
    const nextParam = options?.redirectTo ? `?next=${encodeURIComponent(options.redirectTo)}` : "";
    redirect(`/login${nextParam}`);
  }

  return { user, supabase };
}
