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

// Prefer server-only env var, fall back to public
const API_URL =
  process.env.SERVER_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:4002"

// UUID pattern for entity ID validation
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Headers to forward from backend response
const FORWARD_HEADERS = [
  "cache-control",
  "etag",
  "last-modified",
  "expires",
  "vary",
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle .json endpoints - proxy to Phoenix API
  if (pathname.endsWith(".json")) {
    const pathWithoutJson = pathname.slice(0, -5)
    const segments = pathWithoutJson.split("/").filter(Boolean)

    if (segments.length === 2) {
      const [entityType, id] = segments

      if (ENTITY_TYPES.includes(entityType)) {
        // Validate ID format to prevent path traversal
        if (!UUID_PATTERN.test(id)) {
          return NextResponse.json(
            { error: "Invalid entity ID format" },
            { status: 400 }
          )
        }

        const token = request.cookies.get("jwtToken")?.value

        if (!token) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          )
        }

        const apiUrl = `${API_URL}/api/v2/${entityType}/${id}`

        try {
          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          })

          // Forward selected headers from backend response
          const forwardHeaders = new Headers()
          for (const name of FORWARD_HEADERS) {
            const value = response.headers.get(name)
            if (value !== null) {
              forwardHeaders.set(name, value)
            }
          }

          // Handle non-OK responses
          if (!response.ok) {
            let errorData
            try {
              errorData = await response.json()
            } catch {
              errorData = { error: "Upstream request failed" }
            }
            return NextResponse.json(errorData, {
              status: response.status,
              headers: forwardHeaders,
            })
          }

          // Parse and return JSON
          let data
          try {
            data = await response.json()
          } catch {
            return NextResponse.json(
              { error: "Invalid JSON from backend" },
              { status: 502 }
            )
          }

          return NextResponse.json(data, {
            status: response.status,
            headers: forwardHeaders,
          })
        } catch {
          return NextResponse.json(
            { error: "Upstream service unavailable" },
            { status: 502 }
          )
        }
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
