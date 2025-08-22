"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Typography } from "@mui/material"
import { ResetPasswordForm } from "@/components/auth"
import { useClient } from "@/contexts"
import type { PasswordWithConfirmation } from "@/types"

interface ResetPasswordClientProps {
  token: string
}

export function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [tokenExpired, setTokenExpired] = useState(false)

  const { client } = useClient()
  const router = useRouter()

  const handleSubmit = async (
    password: string,
    passwordConfirmation: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      const passwordData: PasswordWithConfirmation = {
        password,
        password_confirmation: passwordConfirmation,
      }

      await client.resetUserPassword(token, passwordData)
      setSuccess(true)

      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push(
          "/login?message=Password reset successful. Please log in with your new password."
        )
      }, 3000)
    } catch (error_) {
      setLoading(false)

      if (error_ instanceof Error && "response" in error_) {
        const response = (
          error_ as {
            response?: { status?: number; data?: { error?: string } }
          }
        ).response

        if (response?.status === 422) {
          const data = response.data

          // Check for token-related errors
          if (
            data.error?.includes("invalid") ||
            data.error?.includes("expired")
          ) {
            if (data.error?.includes("expired")) {
              setTokenExpired(true)
            }
            setTokenValid(false)
          } else {
            // Password validation errors
            setError(
              data.error ||
                "Password reset failed. Please check your password requirements."
            )
          }
        } else {
          setError("Unable to reset password. Please try again later.")
        }
      } else {
        setError("An unexpected error occurred. Please try again later.")
      }
    }
  }

  return (
    <>
      <ResetPasswordForm
        token={token}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success={success}
        tokenValid={tokenValid}
        tokenExpired={tokenExpired}
      />

      {success && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Redirecting to login page in 3 seconds...
          </Typography>
        </Box>
      )}
    </>
  )
}
