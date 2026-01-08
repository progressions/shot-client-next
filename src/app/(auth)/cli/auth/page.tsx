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

export default function CliAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { client } = useClient()
  const { user, loading: authLoading } = useApp()

  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const code = searchParams.get("code")

  // Check if user is logged in using useApp's loading state
  useEffect(() => {
    if (authLoading) return // Wait for auth to finish loading

    if (!code) {
      setError("No authorization code provided")
      return
    }

    if (!user) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/cli/auth?code=${code}`)
      router.push(`/login?redirect=${returnUrl}`)
    }
  }, [code, router, user, authLoading])

  const handleApprove = useCallback(async () => {
    if (!code) return

    setApproving(true)
    try {
      const response = await client.approveCliAuth(code)

      if (response.status === 200) {
        setApproved(true)
      } else {
        // Extract error message from response with proper type checking
        let message = "Failed to approve authorization"

        if (response && typeof response === "object") {
          const data = response.data as Record<string, unknown> | undefined

          if (
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof data.error === "string"
          ) {
            message = data.error
          } else if (typeof response.status === "number") {
            message = `Failed to approve authorization (status ${String(response.status)})`
          }
        }

        setError(message)
      }
    } catch (err) {
      console.error("Approval error:", err)
      // Extract specific error details from error object
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ??
        (err as Error)?.message ??
        "An error occurred while approving authorization"
      setError(message)
    } finally {
      setApproving(false)
    }
  }, [code, client])

  const handleDeny = useCallback(() => {
    // If opened by another window (e.g., CLI flow popup), try to close this window
    if (
      typeof window !== "undefined" &&
      window.opener &&
      !window.opener.closed
    ) {
      window.close()
      return
    }

    // Otherwise, fall back to redirecting home in the current tab
    router.push("/")
  }, [router])

  // Show loading while auth is initializing
  if (authLoading) {
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
