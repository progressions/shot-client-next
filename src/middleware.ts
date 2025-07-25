import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("jwtToken")?.value
  const { pathname } = request.nextUrl

  // Skip redirect for public routes
  if (["/login"].includes(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/static")) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|static).*)"]
}
