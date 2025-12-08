"use client"

import { useState, useEffect } from "react"
import { Stack, Typography, Alert, CircularProgress, Box } from "@mui/material"
import { Button, TextField } from "@/components/ui"
import { createClient } from "@/lib/client"
import {
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser"
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser"
import type {
  WebAuthnAuthenticationOptions,
  WebAuthnErrorResponse,
} from "@/types/auth"

interface PasskeyLoginProps {
  onSuccess: (token: string) => Promise<void>
}

type PasskeyLoginStep = "email" | "authenticating"

/**
 * PasskeyLogin allows users to sign in using WebAuthn passkey authentication.
 *
 * Displays an email input form, then initiates passkey authentication using
 * the browser's WebAuthn API. On success, calls the onSuccess callback with
 * the JWT token.
 *
 * @param props.onSuccess - Callback invoked with the JWT token after successful login
 *
 * @example
 * <PasskeyLogin onSuccess={async (token) => { await handleLogin(token) }} />
 */
export function PasskeyLogin({ onSuccess }: PasskeyLoginProps) {
  const [step, setStep] = useState<PasskeyLoginStep>("email")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check WebAuthn support on client-side only to avoid hydration mismatch
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn())
  }, [])

  const handlePasskeyLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError(null)
    setStep("authenticating")

    try {
      const client = createClient()

      // Step 1: Get authentication options from server
      const optionsResponse =
        await client.getPasskeyAuthenticationOptions(email)
      const options: WebAuthnAuthenticationOptions = optionsResponse.data

      // Check if user has any registered passkeys
      if (!options.challenge_id) {
        setError("No passkeys found for this email address")
        setStep("email")
        setIsLoading(false)
        return
      }

      if (options.allowCredentials.length === 0) {
        setError("No passkeys found for this email address")
        setStep("email")
        setIsLoading(false)
        return
      }

      // Step 2: Convert options to format expected by @simplewebauthn/browser
      const authOptions = {
        challenge: options.challenge,
        timeout: options.timeout,
        rpId: options.rpId,
        allowCredentials: options.allowCredentials.map(cred => ({
          id: cred.id,
          type: cred.type as "public-key",
          transports: cred.transports,
        })),
        userVerification: options.userVerification,
      }

      // Step 3: Start browser authentication
      let authResponse: AuthenticationResponseJSON
      try {
        authResponse = await startAuthentication({ optionsJSON: authOptions })
      } catch (authError) {
        // User cancelled or authentication failed
        const errorMessage =
          authError instanceof Error
            ? authError.message
            : "Authentication cancelled"

        if (
          errorMessage.includes("cancelled") ||
          errorMessage.includes("abort")
        ) {
          setError("Authentication was cancelled")
        } else {
          setError(`Passkey authentication failed: ${errorMessage}`)
        }
        setStep("email")
        setIsLoading(false)
        return
      }

      // Step 4: Verify authentication with server
      const verifyResponse = await client.verifyPasskeyAuthentication({
        credentialId: authResponse.id,
        authenticatorData: authResponse.response.authenticatorData,
        signature: authResponse.response.signature,
        clientDataJSON: authResponse.response.clientDataJSON,
        challengeId: options.challenge_id,
      })

      // Step 5: Call success handler with token
      await onSuccess(verifyResponse.data.token)
    } catch (error) {
      console.error("Passkey login error:", error)

      // Handle API errors
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: WebAuthnErrorResponse }
        }
        const errorMessage =
          axiosError.response?.data?.error || "Authentication failed"
        setError(errorMessage)
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        )
      }
      setStep("email")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Alert severity="warning" sx={{ width: "100%" }}>
        <Typography variant="body2">
          Your browser does not support passkeys. Please use password or email
          code login instead.
        </Typography>
      </Alert>
    )
  }

  return (
    <Stack direction="column" sx={{ width: "100%" }}>
      {step === "email" && (
        <Stack
          component="form"
          onSubmit={handlePasskeyLogin}
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Typography variant="body2" color="text.secondary">
            Enter your email address to sign in with your passkey.
          </Typography>

          <TextField
            margin="normal"
            required
            name="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            disabled={isLoading}
          />

          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            sx={{ mt: 2 }}
          >
            {isLoading ? "Authenticating..." : "Sign in with Passkey"}
          </Button>
        </Stack>
      )}

      {step === "authenticating" && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Waiting for passkey authentication...
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
            Please use your fingerprint, face, or security key
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
          {error}
        </Alert>
      )}
    </Stack>
  )
}

export default PasskeyLogin
