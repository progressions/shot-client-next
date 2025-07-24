import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("jwtToken")?.value
  if (!token && request.nextUrl.pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/home/:path*"]
}
