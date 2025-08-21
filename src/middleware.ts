// middleware.ts
import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("jwtToken")?.value
  const { pathname } = request.nextUrl

  // Set x-pathname header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  // Skip redirect for public routes
  if (
    ["/login", "/confirm"].includes(pathname) ||
    pathname.startsWith("/redeem/") ||
    pathname.startsWith("/invitations/register/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!_next|static).*)"], // Apply to all routes except _next and static
}
