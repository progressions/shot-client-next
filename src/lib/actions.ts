"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Client from "@/lib/client/Client"

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  const jwtToken = cookieStore.get("jwtToken")?.value

  if (jwtToken) {
    try {
      const client = Client({ jwt: jwtToken })
      await client.logout()
    } catch (error) {
      console.error("Failed to logout on server:", error)
    }
  }

  // Enhanced logout to clear all authentication data
  cookieStore.delete("jwtToken")
  cookieStore.delete("userId") // NEW: Clear user ID cookie
  redirect("/login")
}
