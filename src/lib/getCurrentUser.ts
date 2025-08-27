"use server"

import { getServerClient } from "@/lib"

export async function getCurrentUser() {
  "use server"
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
    if (axiosError?.response?.status === 401 || axiosError?.response?.status === 400) {
      console.log("Authentication error during SSR, returning null user")
      return null
    }
    console.error("Unexpected error in getCurrentUser:", error)
    return null
  }
}
