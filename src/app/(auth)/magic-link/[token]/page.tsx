"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material"
import Cookies from "js-cookie"
import { createClient } from "@/lib/client"
import { useClient } from "@/contexts"
import { UserActions } from "@/reducers"
import { Button } from "@/components/ui"
import Link from "next/link"

export default function PlayerViewMagicLinkPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const { dispatchCurrentUser } = useClient()
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const token = params.token as string

  useEffect(() => {
    // Cleanup redirect timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const redeemMagicLink = async () => {
      try {
        const client = createClient()
        const response = await client.redeemPlayerViewToken(token)

        const { jwt, user, redirect_url } = response.data

        if (jwt && user) {
          // Store JWT
          Cookies.set("jwtToken", jwt, {
            expires: 7, // Match JWT token expiry (7 days)
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            httpOnly: false,
            path: "/",
          })

          // Store user ID
          Cookies.set("userId", user.id, {
            expires: 7, // Match JWT token expiry (7 days)
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            httpOnly: false,
            path: "/",
          })

          // Update context
          dispatchCurrentUser({
            type: UserActions.USER,
            payload: user,
          })

          setStatus("success")

          // Redirect to Player View after brief delay
          redirectTimeoutRef.current = setTimeout(() => {
            router.push(redirect_url)
          }, 1500)
        } else {
          setStatus("error")
          setErrorMessage("Invalid or expired link")
        }
      } catch (error: unknown) {
        console.error("Player view magic link error:", error)

        // Extract error message from response if available
        let message = "Failed to verify magic link. Please try again."
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { error?: string } }
          }
          if (axiosError.response?.data?.error) {
            message = axiosError.response.data.error
          }
        }

        setStatus("error")
        setErrorMessage(message)
      }
    }

    redeemMagicLink()
  }, [token, router, dispatchCurrentUser])

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" sx={{ color: "#ffffff", mb: 2 }}>
              Joining the encounter...
            </Typography>
            <Typography variant="body2" sx={{ color: "#cccccc" }}>
              Please wait while we set up your Player View.
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Typography variant="h5" sx={{ color: "#ffffff", mb: 2 }}>
              Welcome to the fight!
            </Typography>
            <Typography variant="body2" sx={{ color: "#cccccc", mb: 3 }}>
              Redirecting you to the Player View...
            </Typography>
            <CircularProgress size={30} />
          </>
        )}

        {status === "error" && (
          <>
            <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
              {errorMessage}
            </Alert>
            <Typography variant="body2" sx={{ color: "#cccccc", mb: 3 }}>
              This link may have expired (links are valid for 10 minutes) or has
              already been used.
            </Typography>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <Button>Back to Login</Button>
            </Link>
          </>
        )}
      </Box>
    </Container>
  )
}
