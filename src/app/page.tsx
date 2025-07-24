"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container, Typography, Box, Alert, Button } from "@mui/material"
import Cookies from "js-cookie"

export default function HomePage() {
  const [user, setUser] = useState<{ id: number, email: string, name?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const token = Cookies.get("jwtToken")
      if (!token) {
        setError("Not authenticated")
        setLoading(false)
        router.push("/login")
        return
      }
      try {
        console.log("token", token)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/current`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }
        const user = await response.json()
        console.log("user", user)
        setUser(user)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = () => {
    Cookies.remove("jwtToken")
    router.push("/login")
  }

  if (loading) return <Typography sx={{ color: "#ffffff" }}>Loading...</Typography>
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" sx={{ color: "#ffffff" }}>
          Welcome{user?.name ? `, ${user.name}` : ""}
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Box>
        <Typography variant="body1" sx={{ color: "#ffffff" }}>
          Email: {user?.email}
        </Typography>
        <Typography variant="body1" sx={{ color: "#ffffff" }}>
          ID: {user?.id}
        </Typography>
      </Box>
    </Container>
  )
}
