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
      throw new Error("Failed to fetch user data")
    }
    return data
  } catch (error) {
    console.error(error)
    return null
  }
}
