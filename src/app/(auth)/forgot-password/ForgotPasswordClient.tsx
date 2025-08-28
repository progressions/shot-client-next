"use client"

import { useState } from "react"
import { Box, Typography } from "@mui/material"
import { ForgotPasswordForm } from "@/components/auth"
import { useClient } from "@/contexts"

export function ForgotPasswordClient() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    retryAfter?: number
    message?: string
  } | null>(null)

  const { client } = useClient()

  const handleSubmit = async (email: string) => {
    setLoading(true)
    setError(null)
    setRateLimitInfo(null)

    try {
      await client.sendResetPasswordLink(email)
      setSuccess(true)
    } catch (error_) {
      setLoading(false)

      if (error_ instanceof Error && "response" in error_) {
        const response = (
          error_ as {
            response?: {
              status?: number
              data?: { error?: string; retry_after?: number }
            }
          }
        ).response

        if (response?.status === 429) {
          // Rate limiting error
          const data = response.data
          setRateLimitInfo({
            retryAfter: data.retry_after,
            message:
              data.error ||
              "Too many password reset attempts. Please wait before trying again.",
          })
        } else if (response?.status === 422) {
          // Validation error
          const data = response.data
          setError(data.error || "Invalid email format")
        } else {
          setError(
            "Unable to send password reset email. Please try again later."
          )
        }
      } else {
        setError("An unexpected error occurred. Please try again later.")
      }
    }

    if (!success) {
      setLoading(false)
    }
  }

  return (
    <>
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success={success}
        rateLimitInfo={rateLimitInfo}
      />

      {success && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Didn&apos;t receive the email?{" "}
            <Typography
              component="button"
              variant="body2"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              onClick={() => {
                setSuccess(false)
                setError(null)
                setRateLimitInfo(null)
              }}
            >
              Try again
            </Typography>
          </Typography>
        </Box>
      )}
    </>
  )
}
