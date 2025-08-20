"use client"

import Cookies from "js-cookie"
import { logoutAction } from "@/lib/actions"

export async function handleLogout(): Promise<void> {
  // Clear all user caches - be aggressive to prevent pollution
  if (typeof window !== "undefined") {
    Object.keys(localStorage)
      .filter(key => key.startsWith("currentUser-") || key.startsWith("currentCampaign-"))
      .forEach(key => localStorage.removeItem(key))
  }
  
  // Clear client-side cookies as well (redundant with server action but ensures cleanup)
  Cookies.remove("jwtToken")
  Cookies.remove("userId")
  
  // Call the server action to handle server-side logout and redirect
  await logoutAction()
}