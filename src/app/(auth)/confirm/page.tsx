"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Button,
} from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { useApp } from "@/contexts"
import { createClient } from "@/lib/client"

import type { ConfirmationResponse } from "@/types"

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    dispatchCurrentUser: _dispatchCurrentUser,
    setCurrentCampaign: _setCurrentCampaign,
  } = useApp()
  const [loading, setLoading] = useState(true)
  const [response, setResponse] = useState<ConfirmationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const confirmationToken = searchParams.get("confirmation_token")

  const confirmAccount = useCallback(async () => {
    if (!confirmationToken) return

    try {
      // Create a client without JWT for public access
      const client = createClient()
      const res = await client.confirmUserPublic(confirmationToken)
      const data = res.data

      if (res.status === 200) {
        setResponse(data)
      } else {
        setError(data.error || "Failed to confirm account")
        setResponse(data)
      }
    } catch (err) {
      console.error("Confirmation error:", err)
      setError("An error occurred while confirming your account")
    } finally {
      setLoading(false)
    }
  }, [confirmationToken, router])

  useEffect(() => {
    if (!confirmationToken) {
      setError("No confirmation token provided")
      setLoading(false)
      return
    }

    confirmAccount()
  }, [confirmationToken, confirmAccount])

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Stack spacing={3} alignItems="center">
          <CircularProgress />
          <Typography variant="h6">Confirming your account...</Typography>
        </Stack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, width: "100%" }}>
          <Stack spacing={3} alignItems="center">
            <ErrorOutlineIcon sx={{ fontSize: 60, color: "error.main" }} />
            <Typography variant="h5" gutterBottom>
              Confirmation Failed
            </Typography>
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
              {response?.errors && (
                <ul>
                  {response.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </Alert>
            <Button
              variant="contained"
              onClick={() => router.push("/login")}
              fullWidth
            >
              Go to Login
            </Button>
          </Stack>
        </Paper>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 500, width: "100%" }}>
        <Stack spacing={3} alignItems="center">
          <CheckCircleOutlineIcon
            sx={{ fontSize: 60, color: "success.main" }}
          />
          <Typography variant="h5" gutterBottom>
            {response?.message === "Account already confirmed"
              ? "Account Already Confirmed"
              : "Account Confirmed!"}
          </Typography>

          {response?.message === "Account already confirmed" ? (
            <>
              <Typography variant="body1" textAlign="center">
                Your account has already been confirmed. You can log in to
                access your campaigns.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push("/login")}
                fullWidth
              >
                Go to Login
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body1" textAlign="center">
                Welcome to the Chi War! Your account has been successfully
                confirmed.
              </Typography>

              <Button
                variant="contained"
                onClick={() => router.push("/login")}
                fullWidth
              >
                Go to Login
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}
