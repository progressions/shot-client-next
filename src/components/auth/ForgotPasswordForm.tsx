"use client"

import { useState } from "react"
import { Stack, Alert, Typography, FormHelperText } from "@mui/material"
import { Button, TextField } from "@/components/ui"

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>
  loading?: boolean
  error?: string | null
  success?: boolean
  rateLimitInfo?: {
    retryAfter?: number
    message?: string
  }
}

export default function ForgotPasswordForm({
  onSubmit,
  loading = false,
  error = null,
  success = false,
  rateLimitInfo,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError("Email address is required")
      return false
    }

    // Basic email format validation (RFC 5322 patterns)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }

    if (email.length > 254) {
      setEmailError("Email address is too long")
      return false
    }

    setEmailError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      return
    }

    try {
      await onSubmit(email)
    } catch (error) {
      // Error handling is managed by parent component
      console.error("Password reset request failed:", error)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    // Clear email error when user starts typing
    if (emailError) {
      setEmailError(null)
    }
  }

  const formatRetryTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} seconds`
    }
    const minutes = Math.floor(seconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""}`
  }

  return (
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
        type="email"
        value={email}
        onChange={handleEmailChange}
        autoFocus
        disabled={loading || success}
        error={!!emailError}
        helperText={emailError}
        autoComplete="email"
      />

      {rateLimitInfo && (
        <FormHelperText error sx={{ mt: 1 }}>
          {rateLimitInfo.message || "Too many password reset attempts."}
          {rateLimitInfo.retryAfter && (
            <>
              {" "}
              Please wait {formatRetryTime(rateLimitInfo.retryAfter)} before
              trying again.
            </>
          )}
        </FormHelperText>
      )}

      <Button
        type="submit"
        disabled={loading || success || !!emailError}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? "Sending..." : "Send Password Reset Email"}
      </Button>

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            If your email address exists in our database, you will receive a
            password recovery link at your email address in a few minutes.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontSize: "0.875rem" }}>
            Please check your email and follow the instructions to reset your
            password.
          </Typography>
        </Alert>
      )}

      {error && !rateLimitInfo && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        <strong>Security Notice:</strong> For your protection, we limit password
        reset requests to prevent abuse. If you don&apos;t receive an email,
        please check your spam folder or contact your campaign gamemaster.
      </Typography>
    </Stack>
  )
}
