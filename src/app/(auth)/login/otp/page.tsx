"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

function MagicLinkHandler() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dispatchCurrentUser } = useClient()

  const token = searchParams.get("token")

  useEffect(() => {
    const verifyMagicLink = async () => {
      if (!token) {
        setStatus("error")
        setErrorMessage("Invalid magic link - no token provided")
        return
      }

      try {
        const client = createClient()
        const response = await client.verifyMagicLink(token)

        if (response.data.token) {
          // Store JWT
          Cookies.set("jwtToken", response.data.token, {
            expires: 7, // Match JWT token expiry (7 days)
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            httpOnly: false,
            path: "/",
          })

          // Get current user
          const temporaryClient = createClient({ jwt: response.data.token })
          const userResponse = await temporaryClient.getCurrentUser()

          // Store user ID
          Cookies.set("userId", userResponse.data.id, {
            expires: 7, // Match JWT token expiry (7 days)
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            httpOnly: false,
            path: "/",
          })

          // Update context
          dispatchCurrentUser({
            type: UserActions.USER,
            payload: userResponse.data,
          })

          setStatus("success")

          // Redirect after brief delay
          setTimeout(() => {
            router.push("/")
          }, 1500)
        } else {
          setStatus("error")
          setErrorMessage("Invalid or expired link")
        }
      } catch (error) {
        console.error("Magic link verification error:", error)
        setStatus("error")
        setErrorMessage("Failed to verify magic link. Please try again.")
      }
    }

    verifyMagicLink()
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
              Verifying your magic link...
            </Typography>
            <Typography variant="body2" sx={{ color: "#cccccc" }}>
              Please wait while we log you in.
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Typography variant="h5" sx={{ color: "#ffffff", mb: 2 }}>
              Login successful!
            </Typography>
            <Typography variant="body2" sx={{ color: "#cccccc", mb: 3 }}>
              Redirecting you to the app...
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
              Your magic link may have expired or already been used.
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

export default function MagicLinkPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm">
          <Box
            sx={{
              mt: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        </Container>
      }
    >
      <MagicLinkHandler />
    </Suspense>
  )
}
