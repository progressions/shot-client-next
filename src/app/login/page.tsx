"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, TextField, Button, Typography, Alert, Container } from "@mui/material"
import Cookies from "js-cookie"
import { useClient } from "@/contexts" // For dispatch
import Client from "@/lib/Client" // For temp client instance
import { UserActions } from "@/reducers/userState" // Add this import for the action type

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { dispatchCurrentUser } = useClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/sign_in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { email, password } })
      })
      if (!response.ok) {
        throw new Error("Login failed")
      }

      const token = response.headers.get("Authorization")?.split(" ")?.[1] || ""
      Cookies.set("jwtToken", token, { expires: 1, secure: true, sameSite: "Strict" })

      // Create temp Client with fresh token, fetch user, and dispatch to update context
      const tempClient = new Client({ jwt: token })
      const tempResponse = await tempClient.getCurrentUser()
      dispatchCurrentUser({ type: UserActions.USER, payload: tempResponse.data })

      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Login error:", err) // Debug log
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: "#ffffff" }}>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            InputLabelProps={{ style: { color: "#b0bec5" } }}
            InputProps={{ style: { color: "#ffffff" } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: "#b0bec5" } }}
            InputProps={{ style: { color: "#ffffff" } }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  )
}
