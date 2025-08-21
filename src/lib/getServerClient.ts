"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/client"

export async function getServerClient() {
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value

  if (!token) {
    return null
  }

  const client = createClient({ jwt: token })
  return client
}
