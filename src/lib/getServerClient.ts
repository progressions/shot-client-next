"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import Client from "@/lib/Client"
import type { User } from "@/types/types"

export async function getServerClient(): Promise<Client | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value

  if (!token) {
    return null
  }

  const client = new Client({ jwt: token })
  return client
}

export async function getUser() {
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
    return data as User
  } catch (err) {
    console.error(err)
    return null
  }
}
