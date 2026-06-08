import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const TOKEN_COOKIE = "oscar_token";

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

async function fetchSession(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname === "/login" || pathname === "/register") {
    if (!token) {
      return NextResponse.next();
    }

    const session = await fetchSession(token);
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const response = NextResponse.next();
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await fetchSession(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }

  if (isAdminRoute(pathname)) {
    if (session.rol !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
