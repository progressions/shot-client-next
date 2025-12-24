/**
 * Auth Conflict Resolution
 *
 * Handles authentication conflict resolution when localStorage and backend
 * users don't match. Clears all frontend authentication data, calls backend
 * logout, and redirects to login.
 *
 * @module contexts/AppContext/utils/authConflict
 */

import Cookies from "js-cookie"
import type { Client } from "@/lib"

/**
 * Storage key patterns used for authentication data.
 */
export const AUTH_STORAGE_PATTERNS = {
  currentUser: "currentUser-",
  currentCampaign: "currentCampaign-",
  jwt: "jwt",
  token: "token",
} as const

/**
 * Handles authentication conflict resolution when localStorage and backend users don't match.
 * Clears all frontend authentication data, calls backend logout, and redirects to login.
 *
 * @param jwt - Current JWT token (may be null)
 * @param client - API client instance for logout call
 */
export function handleAuthConflictResolution(
  jwt: string | null,
  client: Client
): void {
  console.log("🔄 Resolving authentication conflict...")

  // 1. Clear all localStorage authentication data
  if (typeof window !== "undefined") {
    // Clear all auth-related localStorage items
    // We need to iterate through all possible keys since Object.keys doesn't work reliably in tests
    const keysToCheck: string[] = []

    // Build list of keys to check
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keysToCheck.push(key)
    }

    // Also check known key patterns directly
    if (jwt) {
      keysToCheck.push(`currentUser-${jwt}`)
    }

    // Filter and remove matching keys
    const keysToRemove = keysToCheck.filter(
      key =>
        key.startsWith(AUTH_STORAGE_PATTERNS.currentUser) ||
        key.startsWith(AUTH_STORAGE_PATTERNS.currentCampaign) ||
        key.includes(AUTH_STORAGE_PATTERNS.jwt) ||
        key.includes(AUTH_STORAGE_PATTERNS.token)
    )

    console.log(`  Clearing ${keysToRemove.length} localStorage keys`)
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    // Clear sessionStorage as well
    sessionStorage.clear()
  }

  // 2. Clear cookies
  Cookies.remove("jwtToken")
  Cookies.remove("userId")

  // 3. Attempt stateless backend logout (fire and forget)
  if (jwt) {
    // Fire the logout request but don't wait for it
    client.logout().catch(() => {
      // Silently ignore logout errors during conflict resolution
      console.log("  Backend logout request failed (continuing anyway)")
    })
  }

  // 4. Redirect to login page
  console.log("  Redirecting to /login...")
  window.location.href = "/login"
}
