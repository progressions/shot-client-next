"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  const jwtToken = cookieStore.get("jwtToken")?.value

  if (jwtToken) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
    } catch (error) {
      console.error("Failed to logout on server:", error)
    }
  }

  // Enhanced logout to clear all authentication data
  cookieStore.delete("jwtToken")
  cookieStore.delete("userId") // NEW: Clear user ID cookie
  redirect("/login")
}
