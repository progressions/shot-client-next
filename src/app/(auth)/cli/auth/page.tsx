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
} from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import TerminalIcon from "@mui/icons-material/Terminal"
import { Button } from "@/components/ui"
import { useClient, useApp } from "@/contexts"
import Cookies from "js-cookie"

export default function CliAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const client = useClient()
  const { user } = useApp()

  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const code = searchParams.get("code")

  // Check if user is logged in
  useEffect(() => {
    const token = Cookies.get("jwtToken") || localStorage.getItem("jwtToken")

    if (!code) {
      setError("No authorization code provided")
      setLoading(false)
      return
    }

    if (!token) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/cli/auth?code=${code}`)
      router.push(`/login?redirect=${returnUrl}`)
      return
    }

    // User is logged in, show approval screen
    setLoading(false)
  }, [code, router])

  const handleApprove = useCallback(async () => {
    if (!code) return

    setApproving(true)
    try {
      const response = await client.post("/api/v2/cli/auth/approve", { code })

      if (response.status === 200) {
        setApproved(true)
      } else {
        setError(response.data?.error || "Failed to approve authorization")
      }
    } catch (err) {
      console.error("Approval error:", err)
      setError("An error occurred while approving authorization")
    } finally {
      setApproving(false)
    }
  }, [code, client])

  const handleDeny = useCallback(() => {
    // Just close the window or redirect home
    window.close()
    // If window.close doesn't work (not opened by script), redirect
    setTimeout(() => {
      router.push("/")
    }, 100)
  }, [router])

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
          <Typography variant="h6">Loading...</Typography>
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
              Authorization Failed
            </Typography>
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => router.push("/")}
              fullWidth
            >
              Go to Home
            </Button>
          </Stack>
        </Paper>
      </Box>
    )
  }

  if (approved) {
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
              CLI Authorized!
            </Typography>
            <Typography variant="body1" textAlign="center">
              You can close this window and return to your terminal. The CLI is
              now authenticated.
            </Typography>
            <Button variant="outlined" onClick={() => window.close()} fullWidth>
              Close Window
            </Button>
          </Stack>
        </Paper>
      </Box>
    )
  }

  // Show approval prompt
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
          <TerminalIcon sx={{ fontSize: 60, color: "primary.main" }} />
          <Typography variant="h5" gutterBottom>
            Authorize Chi War CLI
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary">
            The Chi War CLI is requesting access to your account.
          </Typography>

          {user && (
            <Alert severity="info" sx={{ width: "100%" }}>
              Signing in as <strong>{user.email}</strong>
            </Alert>
          )}

          <Typography variant="body2" textAlign="center" color="text.secondary">
            This will allow the CLI to create and manage characters, parties,
            fights, and other game content in your campaigns.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ width: "100%", mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleDeny}
              fullWidth
              disabled={approving}
            >
              Deny
            </Button>
            <Button
              variant="contained"
              onClick={handleApprove}
              fullWidth
              disabled={approving}
            >
              {approving ? "Authorizing..." : "Authorize"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
