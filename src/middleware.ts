import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Nếu chưa cấu hình Supabase URL/Key hoặc đang chạy test placeholder, cho request đi qua
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    return response;
  }

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isPublicApi = pathname.startsWith("/api/audio");

  // Các route audio công khai (phục vụ phát âm thẻ bài học) không cần kiểm tra đăng nhập
  if (isPublicApi) {
    return response;
  }

  // Tối ưu hóa hiệu năng: Kiểm tra xem request có cookie auth của Supabase hay không
  // Cookie auth của Supabase mặc định bắt đầu bằng 'sb-' và chứa '-auth-token'
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  // 1. Chưa có cookie auth và đang ở /login -> Cho qua ngay lập tức không cần gọi Supabase (0ms)
  if (!hasAuthCookie && isLoginPage) {
    return response;
  }

  // 2. Chưa có cookie auth mà truy cập route được bảo vệ -> Chuyển hướng sang /login ngay (0ms)
  if (!hasAuthCookie && !isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
        if (headers) {
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        }
      },
    },
  });

  // Tối ưu hóa: Dùng getClaims() theo khuyến nghị chính thức của Supabase SSR
  // để xác thực JWT signature cục bộ (vô cùng nhanh) thay vì gọi HTTP round-trip getUser()
  let hasValidSession = false;
  try {
    const { data: claimsData } = await supabase.auth.getClaims();
    if (claimsData?.claims) {
      hasValidSession = true;
    } else {
      // Fallback an toàn nếu token cần refresh hoặc JWT dạng đối xứng
      const { data: userData } = await supabase.auth.getUser();
      hasValidSession = Boolean(userData?.user);
    }
  } catch (err) {
    console.error("[Middleware Auth Token Sync Error]:", err);
  }

  // 3. Cookie không hợp lệ hoặc đã thu hồi mà truy cập route được bảo vệ -> Chuyển hướng sang /login?next=...
  if (!hasValidSession && !isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Đã đăng nhập mà truy cập /login -> Chuyển hướng về trang chủ /
  if (hasValidSession && isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Khớp tất cả các đường dẫn trừ static files, api audio và hình ảnh
     */
    "/((?!_next/static|_next/image|favicon.ico|api/audio|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
