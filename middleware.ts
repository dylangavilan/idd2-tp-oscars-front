import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

const adminRoutes = [
  /^\/ceremonies\/new$/,
  /^\/ceremonies\/[^/]+\/edit$/,
  /^\/movies\/new$/,
  /^\/movies\/[^/]+\/edit$/,
  /^\/professionals\/new$/,
  /^\/professionals\/[^/]+\/edit$/,
  /^\/categories\/new$/,
  /^\/categories\/[^/]+\/edit$/,
];

const isAdminRoute = (pathname: string) =>
  adminRoutes.some((pattern) => pattern.test(pathname));

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("oscar_token")?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname === "/login") {
    if (token) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute(pathname)) {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return NextResponse.redirect(new URL("/", request.url));
      const { data } = await res.json();
      if (data?.rol !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
