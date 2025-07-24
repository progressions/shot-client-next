import { cookies } from "next/headers"
import Client from "@/lib/Client"

export async function getServerClient() {
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value

  if (!token) {
    return null
  }

  const client = new Client({ jwt: token })
  return client
}
