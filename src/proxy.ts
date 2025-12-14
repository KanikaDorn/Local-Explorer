import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user from cookies, try Authorization header (Bearer token)
  if (!user && request.headers.get("authorization")) {
     const token = request.headers.get("authorization")?.split(" ")[1];
     if (token) {
        const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
        user = tokenUser;
     }
  }

  // Partner API Security (Strict)
  if (request.nextUrl.pathname.startsWith("/api/partner") && !request.nextUrl.pathname.includes("/signup")) {
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  // Inject User ID if available (for both Partner and PayWay routes)
  if (user && (request.nextUrl.pathname.startsWith("/api/partner") || request.nextUrl.pathname.startsWith("/api/payway"))) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("user-id", user.id);
      
      response = NextResponse.next({
          request: {
              headers: requestHeaders,
          },
      });
  }

  // Refresh session if needed
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
