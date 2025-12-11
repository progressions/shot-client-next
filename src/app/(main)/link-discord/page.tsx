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
import { FaDiscord } from "react-icons/fa"
import { useClient } from "@/contexts"

export default function LinkDiscordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { client } = useClient()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  const code = searchParams.get("code")

  const linkDiscord = useCallback(async () => {
    if (!code) return

    try {
      const response = await client.linkDiscord(code.toUpperCase())
      if (response.data.success) {
        setSuccess(true)
        setMessage(response.data.message)
      }
    } catch (err: unknown) {
      console.error("Discord linking error:", err)
      const errorResponse = err as {
        response?: { data?: { error?: string } }
      }
      setError(
        errorResponse.response?.data?.error ||
          "An error occurred while linking your Discord account"
      )
    } finally {
      setLoading(false)
    }
  }, [code, client])

  useEffect(() => {
    if (!code) {
      setError("No link code provided")
      setLoading(false)
      return
    }

    linkDiscord()
  }, [code, linkDiscord])

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
          <Typography variant="h6">Linking your Discord account...</Typography>
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
              Linking Failed
            </Typography>
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
            <Stack spacing={2} sx={{ width: "100%" }}>
              <Button
                variant="contained"
                onClick={() => router.push("/profile")}
                fullWidth
              >
                Go to Profile
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/")}
                fullWidth
              >
                Go to Home
              </Button>
            </Stack>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 50, color: "success.main" }}
            />
            <FaDiscord size={40} color="#5865F2" />
          </Box>
          <Typography variant="h5" gutterBottom>
            Discord Linked!
          </Typography>

          <Typography variant="body1" textAlign="center">
            {message ||
              "Your Discord account has been successfully linked to Chi War."}
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            You can now interact with your Chi War account from Discord.
          </Typography>

          <Stack spacing={2} sx={{ width: "100%" }}>
            <Button
              variant="contained"
              onClick={() => router.push("/profile")}
              fullWidth
            >
              View Profile
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/")}
              fullWidth
            >
              Go to Home
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
