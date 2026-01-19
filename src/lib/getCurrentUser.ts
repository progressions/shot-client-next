"use server"

import { cache } from "react"
import { getServerClient } from "@/lib/getServerClient"

/**
 * Server action to fetch the currently authenticated user.
 *
 * Used for SSR (Server-Side Rendering) to get user data during page load.
 * Handles authentication errors gracefully by returning null instead of throwing,
 * allowing pages to render in an unauthenticated state.
 *
 * Wrapped with React cache() to deduplicate calls within a single request -
 * calling getCurrentUser() multiple times (e.g., in generateMetadata and page)
 * will only make one API call.
 *
 * @returns The authenticated User object, or null if:
 *   - No JWT token is present in cookies
 *   - Token is invalid or expired (401/400 response)
 *   - API returns no user data
 *   - Any unexpected error occurs
 *
 * @example
 * ```tsx
 * // In a Server Component or page
 * const user = await getCurrentUser()
 * if (!user) {
 *   redirect('/login')
 * }
 * ```
 */
export const getCurrentUser = cache(async function getCurrentUser() {
  const client = await getServerClient()
  if (!client) {
    return null
  }
  try {
    const { data } = await client.getCurrentUser()
    if (!data) {
      // Don't throw error, just return null for missing data
      console.log("No user data returned from API")
      return null
    }
    return data
  } catch (error: unknown) {
    // Handle authentication errors gracefully during SSR
    const axiosError = error as { response?: { status?: number } }
    if (
      axiosError?.response?.status === 401 ||
      axiosError?.response?.status === 400
    ) {
      console.log("Authentication error during SSR, returning null user")
      return null
    }
    console.error("Unexpected error in getCurrentUser:", error)
    return null
  }
})
