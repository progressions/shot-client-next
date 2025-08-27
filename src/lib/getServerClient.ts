"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/client"

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
          if (
            error?.response?.status === 400 &&
            (error?.config?.url?.includes("/api/v2/users/current") ||
              error?.config?.url?.includes("/api/v2/campaigns") ||
              error?.config?.url?.includes("/api/v2/"))
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
