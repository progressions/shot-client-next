"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/client"

export async function getServerClient() {
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value

  if (!token) {
    return null
  }

  const client = createClient({ jwt: token })
  
  // Wrap client methods to handle 401 errors
  const wrappedClient = new Proxy(client, {
    get(target, prop) {
      const original = target[prop as keyof typeof target]
      
      // Only wrap functions
      if (typeof original !== "function") {
        return original
      }
      
      // Return wrapped function that handles 401 errors
      return async (...args: any[]) => {
        try {
          return await original.apply(target, args)
        } catch (error: any) {
          // Handle 401 Unauthorized errors
          if (error?.response?.status === 401) {
            console.log("🔥 401 error detected in server component - clearing auth and redirecting")
            
            // Clear authentication cookies
            cookieStore.delete("jwtToken")
            cookieStore.delete("userId")
            
            // Redirect to login page
            redirect("/login")
          }
          
          // Re-throw other errors
          throw error
        }
      }
    }
  })
  
  return wrappedClient
}
