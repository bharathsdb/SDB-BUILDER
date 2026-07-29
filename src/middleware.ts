import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the auth cookie exists
  const isAuth = request.cookies.has('plancraft_auth');
  const authCookieValue = request.cookies.get('plancraft_auth')?.value;
  const isAuthenticated = isAuth && authCookieValue === 'true';
  
  // If user visits the root page
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  // Protect dashboard and workspace routes
  const protectedRoutes = ["/dashboard", "/workspace", "/generate", "/admin"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prevent logged-in users from seeing login or signup page
  if ((pathname === "/login" || pathname === "/signup") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
