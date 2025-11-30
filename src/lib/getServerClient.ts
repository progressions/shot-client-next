"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/client"

/**
 * Server-side function to get an authenticated API client.
 * Reads JWT from cookies and wraps the client to handle auth errors.
 *
 * Use this in Server Components and Server Actions to make authenticated API calls.
 * Automatically redirects to login on 401/400 auth errors.
 *
 * @returns Proxied client that handles auth errors, or null if no JWT token
 *
 * @example
 * ```tsx
 * // In a Server Component
 * export default async function CharacterPage({ params }) {
 *   const client = await getServerClient()
 *   if (!client) redirect("/login")
 *
 *   const { data } = await client.getCharacter(params.id)
 *   return <CharacterView character={data} />
 * }
 * ```
 */
export async function getServerClient() {
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value

  if (!token) {
    return null
  }

  const client = createClient({ jwt: token })

  // Wrap client methods to handle 401 errors
  const wrappedClient = new Proxy(client, {
    get(target, prop) {
      const original = target[prop as keyof typeof target]

      // Only wrap functions
      if (typeof original !== "function") {
        return original
      }

      // Return wrapped function that handles auth errors
      return async (...args: unknown[]) => {
        try {
          return await original.apply(target, args)
        } catch (error: unknown) {
          // Log the full error for debugging
          const axiosError = error as {
            response?: { status?: number; data?: unknown }
          }
          console.log("🔍 Error in server component:", {
            status: axiosError?.response?.status,
            url: (error as { config?: { url?: string } })?.config?.url,
            message: (error as { message?: string })?.message,
            code: (error as { code?: string })?.code,
          })

          // Handle 401 Unauthorized errors
          if (axiosError?.response?.status === 401) {
            console.log(
              "🔥 401 error detected in server component - redirecting to login"
            )

            // Can't modify cookies in Server Component, just redirect
            // The login page or middleware will handle clearing the invalid token
            redirect("/login?error=unauthorized")
          }

          // Handle 400 errors from API endpoints (invalid/expired JWT)
          // This happens when the JWT exists but is invalid for the current environment
          const isCurrentUserRequest =
            error?.config?.url?.includes("/api/v2/users/current") ||
            error?.config?.url?.includes("/api/v2/users/profile")
          const isCampaignRequest =
            error?.config?.url?.includes("/api/v2/campaigns")

          if (
            error?.response?.status === 400 &&
            (isCurrentUserRequest || isCampaignRequest)
          ) {
            console.log(
              "🔥 400 error from API - invalid JWT, redirecting to login"
            )

            // Can't modify cookies in Server Component, just redirect
            // The login page or middleware will handle clearing the invalid token
            redirect("/login?error=invalid_token")
          }

          // Handle 400 error from sign_in endpoint (happens after 401)
          // This occurs when axios follows a redirect from 401 to sign_in.json
          if (
            error?.response?.status === 400 &&
            error?.response?.config?.url?.includes("/users/sign_in.json")
          ) {
            console.log(
              "🔥 400 error from sign_in endpoint - auth failure, redirecting to login"
            )

            // Can't modify cookies in Server Component, just redirect
            redirect("/login?error=auth_failed")
          }

          // Re-throw other errors
          throw error
        }
      }
    },
  })

  return wrappedClient
}
