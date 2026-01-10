// proxy.ts - Next.js 16 proxy configuration (replaces middleware.ts)
import { NextRequest, NextResponse } from "next/server"

// Entity types that support .json endpoints
const ENTITY_TYPES = [
  "parties",
  "characters",
  "fights",
  "sites",
  "factions",
  "vehicles",
  "campaigns",
  "junctures",
  "weapons",
  "schticks",
  "encounters",
]

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4002"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle .json endpoints - proxy to Phoenix API
  if (pathname.endsWith(".json")) {
    const pathWithoutJson = pathname.slice(0, -5)
    const segments = pathWithoutJson.split("/").filter(Boolean)

    if (segments.length === 2) {
      const [entityType, id] = segments

      if (ENTITY_TYPES.includes(entityType)) {
        const token = request.cookies.get("jwtToken")?.value

        if (!token) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          )
        }

        const apiUrl = `${API_URL}/api/v2/${entityType}/${id}`

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
      }
    }
  }

  // Tidewave MCP proxy - rewrite /tidewave requests to API handler
  if (pathname.startsWith("/tidewave")) {
    return NextResponse.rewrite(new URL("/api/tidewave", request.url))
  }

  const token = request.cookies.get("jwtToken")?.value

  // Set x-pathname header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  // Skip redirect for public routes
  if (
    [
      "/",
      "/login",
      "/register",
      "/confirm",
      "/forgot-password",
      "/favicon.ico",
    ].includes(pathname) ||
    pathname.startsWith("/redeem/") ||
    pathname.startsWith("/invitations/register/") ||
    pathname.startsWith("/reset-password/") ||
    pathname.startsWith("/magic-link/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images/")
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
