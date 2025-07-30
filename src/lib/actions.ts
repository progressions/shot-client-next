"use server"

import { cookies } from "next/headers"

export async function logoutAction(jwt: string): Promise<void> {
  if (jwt) {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` },
    })
  }
  const cookieStore = await cookies()
  cookieStore.delete("jwtToken")
}
