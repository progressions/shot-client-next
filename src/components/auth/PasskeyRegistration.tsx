"use client"

import { useState, useEffect } from "react"
import {
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Button, TextField } from "@/components/ui"
import { useClient, useToast } from "@/contexts"
import {
  startRegistration,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser"
import type { RegistrationResponseJSON } from "@simplewebauthn/browser"
import type {
  WebAuthnRegistrationOptions,
  WebAuthnErrorResponse,
} from "@/types/auth"
import KeyIcon from "@mui/icons-material/Key"

interface PasskeyRegistrationProps {
  onSuccess?: () => void
  buttonVariant?: "contained" | "outlined" | "text"
  buttonSize?: "small" | "medium" | "large"
}

type RegistrationStep = "idle" | "naming" | "registering"

export function PasskeyRegistration({
  onSuccess,
  buttonVariant = "outlined",
  buttonSize = "medium",
}: PasskeyRegistrationProps) {
  const [step, setStep] = useState<RegistrationStep>("idle")
  const [passkeyName, setPasskeyName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  // Check WebAuthn support on client-side only to avoid hydration mismatch
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn())
  }, [])

  const handleOpenDialog = () => {
    setDialogOpen(true)
    setStep("naming")
    setPasskeyName(getDefaultPasskeyName())
    setError(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setStep("idle")
    setPasskeyName("")
    setError(null)
    setIsLoading(false)
  }

  const getDefaultPasskeyName = (): string => {
    const ua = navigator.userAgent
    if (ua.includes("iPhone") || ua.includes("iPad")) {
      return ua.includes("iPhone") ? "iPhone" : "iPad"
    }
    if (ua.includes("Mac")) {
      return "Mac"
    }
    if (ua.includes("Windows")) {
      return "Windows PC"
    }
    if (ua.includes("Android")) {
      return "Android Device"
    }
    if (ua.includes("Linux")) {
      return "Linux Device"
    }
    return "My Passkey"
  }

  const handleRegister = async () => {
    if (!passkeyName.trim()) {
      setError("Please enter a name for your passkey")
      return
    }

    setIsLoading(true)
    setError(null)
    setStep("registering")

    try {
      // Step 1: Get registration options from server
      const optionsResponse = await client.getPasskeyRegistrationOptions()
      const options: WebAuthnRegistrationOptions = optionsResponse.data

      // Step 2: Convert options to format expected by @simplewebauthn/browser
      const regOptions = {
        challenge: options.challenge,
        rp: options.rp,
        user: {
          id: options.user.id,
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        attestation: options.attestation,
        excludeCredentials: options.excludeCredentials.map(cred => ({
          id: cred.id,
          type: cred.type as "public-key",
          transports: cred.transports,
        })),
        authenticatorSelection: options.authenticatorSelection,
      }

      // Step 3: Start browser registration
      let regResponse: RegistrationResponseJSON
      try {
        regResponse = await startRegistration({ optionsJSON: regOptions })
      } catch (regError) {
        const errorMessage =
          regError instanceof Error
            ? regError.message
            : "Registration cancelled"

        if (
          errorMessage.includes("cancelled") ||
          errorMessage.includes("abort")
        ) {
          setError("Passkey registration was cancelled")
        } else if (errorMessage.includes("excludeCredentials")) {
          setError("This device already has a passkey registered")
        } else {
          setError(`Passkey registration failed: ${errorMessage}`)
        }
        setStep("naming")
        setIsLoading(false)
        return
      }

      // Step 4: Verify registration with server
      await client.verifyPasskeyRegistration({
        attestationObject: regResponse.response.attestationObject,
        clientDataJSON: regResponse.response.clientDataJSON,
        challengeId: options.challenge_id,
        name: passkeyName.trim(),
      })

      toastSuccess("Passkey registered successfully")
      handleCloseDialog()
      onSuccess?.()
    } catch (error) {
      console.error("Passkey registration error:", error)

      // Handle API errors
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: WebAuthnErrorResponse }
        }
        const errorMessage =
          axiosError.response?.data?.error || "Registration failed"
        setError(errorMessage)
        toastError(errorMessage)
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        setError(message)
        toastError(message)
      }
      setStep("naming")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={handleOpenDialog}
        startIcon={<KeyIcon />}
      >
        Add Passkey
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Register a New Passkey</DialogTitle>

        <DialogContent>
          {step === "naming" && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Give your passkey a name to help you identify it later (e.g.,
                &quot;MacBook Pro&quot; or &quot;iPhone&quot;).
              </Typography>

              <TextField
                autoFocus
                label="Passkey Name"
                value={passkeyName}
                onChange={e => setPasskeyName(e.target.value)}
                disabled={isLoading}
                fullWidth
                inputProps={{ maxLength: 100 }}
              />

              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          )}

          {step === "registering" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1">
                Waiting for passkey registration...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please use your fingerprint, face, or security key
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="text"
            onClick={handleCloseDialog}
            disabled={isLoading && step === "registering"}
          >
            Cancel
          </Button>
          {step === "naming" && (
            <Button
              onClick={handleRegister}
              disabled={isLoading || !passkeyName.trim()}
            >
              {isLoading ? "Registering..." : "Continue"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PasskeyRegistration
