"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Stack,
  Box,
  Typography,
  Alert,
  Container,
  Tabs,
  Tab,
} from "@mui/material"
import Link from "next/link"
import { Button, TextField } from "@/components/ui"
import Cookies from "js-cookie"
import { useClient } from "@/contexts"
import { createClient } from "@/lib/client"
import { UserActions } from "@/reducers"

type LoginMethod = "password" | "otp"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpEmail, setOtpEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isUnconfirmed, setIsUnconfirmed] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dispatchCurrentUser } = useClient()

  const redirectTo = searchParams.get("redirect") || "/"
  const authError = searchParams.get("error")

  // Clear cookies when there's an auth error from server component
  useEffect(() => {
    if (
      authError === "invalid_token" ||
      authError === "unauthorized" ||
      authError === "auth_failed"
    ) {
      console.log("Clearing invalid authentication data due to:", authError)

      // Clear cookies
      Cookies.remove("jwtToken")
      Cookies.remove("userId")

      // Clear localStorage
      if (typeof window !== "undefined") {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (
            key &&
            (key.startsWith("currentUser-") ||
              key.startsWith("currentCampaign-") ||
              key.includes("jwt") ||
              key.includes("token"))
          ) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        sessionStorage.clear()
      }

      // Show appropriate error message
      if (authError === "invalid_token") {
        setError("Your session has expired. Please log in again.")
      } else if (authError === "unauthorized") {
        setError("Authentication failed. Please log in again.")
      }
    }
  }, [authError])

  const handleLoginSuccess = async (token: string) => {
    Cookies.set("jwtToken", token, {
      expires: 1,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      httpOnly: false,
      path: "/",
    })

    const temporaryClient = createClient({ jwt: token })
    const temporaryResponse = await temporaryClient.getCurrentUser()

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
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

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
        const errorData = await response.json()

        if (errorData.error_type === "unconfirmed_account") {
          setIsUnconfirmed(true)
          setUnconfirmedEmail(errorData.email)
          setError(null)
          return
        } else {
          throw new Error(errorData.message || "Login failed")
        }
      }

      const authHeader = response.headers.get("Authorization")
      const token = authHeader?.split(" ")?.[1] || ""

      if (!token) {
        throw new Error("No authentication token received from server")
      }

      await handleLoginSuccess(token)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "An error occurred")
      setIsUnconfirmed(false)
      console.error("Login error:", error_)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/otp/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: otpEmail }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setSuccessMessage(data.message || "Check your email for a login code")
      } else {
        throw new Error(data.error || "Failed to send login code")
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "An error occurred")
      console.error("OTP request error:", error_)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/otp/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: otpEmail, code: otpCode }),
        }
      )

      const data = await response.json()

      if (response.ok && data.token) {
        await handleLoginSuccess(data.token)
      } else {
        throw new Error(data.error || "Invalid code")
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "An error occurred")
      console.error("OTP verify error:", error_)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return

    setIsResending(true)
    setResendMessage(null)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/confirmation/resend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: unconfirmedEmail }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setResendMessage(data.message)
      } else {
        setError(data.error || "Failed to resend confirmation email")
      }
    } catch (error_) {
      setError("Failed to resend confirmation email. Please try again.")
      console.error("Resend confirmation error:", error_)
    } finally {
      setIsResending(false)
    }
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: LoginMethod) => {
    setLoginMethod(newValue)
    setError(null)
    setSuccessMessage(null)
    setIsUnconfirmed(false)
    setOtpSent(false)
    setOtpCode("")
  }

  const handleBackToEmailEntry = () => {
    setOtpSent(false)
    setOtpCode("")
    setError(null)
    setSuccessMessage(null)
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

        <Tabs
          value={loginMethod}
          onChange={handleTabChange}
          sx={{ mb: 3, width: "100%" }}
          centered
        >
          <Tab value="password" label="Password" />
          <Tab value="otp" label="Email Code" />
        </Tabs>

        {loginMethod === "password" && (
          <Stack
            direction="column"
            component="form"
            onSubmit={handlePasswordSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              name="email"
              label="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Box sx={{ textAlign: "right", mt: 1 }}>
              <Link
                href="/forgot-password"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot Password?
                </Typography>
              </Link>
            </Box>
            <Button type="submit" disabled={isSubmitting} sx={{ mt: 2, mb: 2 }}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            {/* Unconfirmed account message */}
            {isUnconfirmed && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Please confirm your email address before logging in.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  sx={{ mt: 1 }}
                >
                  {isResending ? "Sending..." : "Resend Confirmation Email"}
                </Button>
              </Alert>
            )}

            {/* Resend success message */}
            {resendMessage && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {resendMessage}
              </Alert>
            )}
          </Stack>
        )}

        {loginMethod === "otp" && !otpSent && (
          <Stack
            direction="column"
            component="form"
            onSubmit={handleOtpRequest}
            sx={{ mt: 1, width: "100%" }}
          >
            <Typography variant="body2" sx={{ color: "#cccccc", mb: 2 }}>
              Enter your email address and we&apos;ll send you a login code.
            </Typography>
            <TextField
              margin="normal"
              required
              name="email"
              label="Email Address"
              type="email"
              value={otpEmail}
              onChange={e => setOtpEmail(e.target.value)}
              autoFocus
            />
            <Button type="submit" disabled={isSubmitting} sx={{ mt: 2, mb: 2 }}>
              {isSubmitting ? "Sending..." : "Send Login Code"}
            </Button>
          </Stack>
        )}

        {loginMethod === "otp" && otpSent && (
          <Stack
            direction="column"
            component="form"
            onSubmit={handleOtpVerify}
            sx={{ mt: 1, width: "100%" }}
          >
            <Typography variant="body2" sx={{ color: "#cccccc", mb: 2 }}>
              Enter the 6-digit code sent to {otpEmail}
            </Typography>
            <TextField
              margin="normal"
              required
              name="code"
              label="Login Code"
              value={otpCode}
              onChange={e => setOtpCode(e.target.value)}
              autoFocus
              inputProps={{
                maxLength: 6,
                inputMode: "numeric",
                pattern: "[0-9]*",
                style: { letterSpacing: "0.5em", textAlign: "center" },
              }}
            />
            <Button type="submit" disabled={isSubmitting} sx={{ mt: 2, mb: 2 }}>
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="text"
                size="small"
                onClick={handleBackToEmailEntry}
                sx={{ color: "primary.main" }}
              >
                Use a different email
              </Button>
            </Box>
          </Stack>
        )}

        {/* Success message */}
        {successMessage && (
          <Alert severity="success" sx={{ mt: 2, width: "100%" }}>
            {successMessage}
          </Alert>
        )}

        {/* General error message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#cccccc" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Create account
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
