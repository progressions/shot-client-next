"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container, Typography, Box, Alert, Button, Avatar } from "@mui/material"
import Cookies from "js-cookie"

interface User {
  id: string
  email: string
  name: string
  first_name: string
  last_name: string
  admin: boolean
  gamemaster: boolean
  image_url: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/users/current`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }
        const { data } = await response.json()
        console.log("user", data)
        setUser(data)
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
          Welcome, {user?.name}
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar src={user?.image_url} alt={user?.name} sx={{ width: 56, height: 56, mr: 2 }} />
        <Box>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            Email: {user?.email}
          </Typography>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            Name: {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            ID: {user?.id}
          </Typography>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            Admin: {user?.admin ? "Yes" : "No"}
          </Typography>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            Gamemaster: {user?.gamemaster ? "Yes" : "No"}
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
