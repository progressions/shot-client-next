"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Stack, Box, Typography, Alert, Container } from "@mui/material"
import { Button, TextField } from "@/components/ui"
import Cookies from "js-cookie"
import { useClient } from "@/contexts"
import { Client } from "@/lib"
import { UserActions } from "@/reducers"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dispatchCurrentUser } = useClient()

  const redirectTo = searchParams.get("redirect") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/sign_in`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: { email, password } }),
        }
      )
      if (!response.ok) {
        throw new Error("Login failed")
      }

      const authHeader = response.headers.get("Authorization")

      const token = authHeader?.split(" ")?.[1] || ""

      if (!token) {
        throw new Error("No authentication token received from server")
      }

      Cookies.set("jwtToken", token, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        httpOnly: false,
        path: "/",
      })

      // Verify the cookie was set
      const _setCookie = Cookies.get("jwtToken")

      const temporaryClient = new Client({ jwt: token })
      const temporaryResponse = await temporaryClient.getCurrentUser()
      
      // NEW: Store user ID alongside JWT for cache validation
      Cookies.set("userId", temporaryResponse.data.id, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        httpOnly: false,
        path: "/",
      })
      
      dispatchCurrentUser({
        type: UserActions.USER,
        payload: temporaryResponse.data,
      })

      router.push(redirectTo)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "An error occurred")
      console.error("Login error:", error_)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: "#ffffff" }}
        >
          Login to Chi War
        </Typography>
        <Stack
          direction="column"
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            label="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit" sx={{ mt: 3, mb: 2 }}>
            Sign In
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Stack>
      </Box>
    </Container>
  )
}
