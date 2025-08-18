"use server"

import { cookies } from "next/headers"
import { Client } from "@/lib"

export async function getServerClient(): Promise<Client | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value

  console.log("🔍 getServerClient - checking for JWT token")
  console.log("🔍 Available cookies:", cookieStore.getAll().map(c => c.name))
  console.log("🔍 JWT token found:", token ? `${token.substring(0, 20)}...` : "NONE")
  console.log("🔍 getServerClient called for server-side request")

  if (!token) {
    console.log("❌ getServerClient - no token found in cookies")
    console.log("💡 This will cause redirect to login")
    return null
  }

  console.log("✅ getServerClient - creating client with token")
  const client = new Client({ jwt: token })
  return client
}
