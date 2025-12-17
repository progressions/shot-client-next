"use client"

import { useState, useEffect } from "react"
import { Stack, Alert, Typography } from "@mui/material"
import { Button, TextField } from "@/components/ui"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"
import { usePasswordValidation } from "@/hooks"

interface ResetPasswordFormProps {
  token: string
  onSubmit: (password: string, passwordConfirmation: string) => Promise<void>
  loading?: boolean
  error?: string | null
  success?: boolean
  tokenValid?: boolean
  tokenExpired?: boolean
}

export default function ResetPasswordForm({
  token: _token,
  onSubmit,
  loading = false,
  error = null,
  success = false,
  tokenValid = true,
  tokenExpired = false,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null
  )

  const { validation, validateField, validateConfirmation, getFirstError } =
    usePasswordValidation()

  useEffect(() => {
    if (password) {
      validateField(password)
    }
  }, [password, validateField])

  useEffect(() => {
    if (passwordConfirmation) {
      const error = validateConfirmation(password, passwordConfirmation)
      setConfirmationError(error)
    } else {
      setConfirmationError(null)
    }
  }, [password, passwordConfirmation, validateConfirmation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validation.isValid || confirmationError) {
      return
    }

    try {
      await onSubmit(password, passwordConfirmation)
    } catch (error) {
      // Error handling is managed by parent component
      console.error("Password reset failed:", error)
    }
  }

  if (!tokenValid || tokenExpired) {
    return (
      <Stack direction="column" sx={{ mt: 1, width: "100%" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {tokenExpired ? "Reset Link Expired" : "Invalid Reset Link"}
          </Typography>
          <Typography variant="body2">
            {tokenExpired
              ? "This password reset link has expired. Password reset links are valid for 2 hours for security reasons."
              : "This password reset link is invalid or has already been used."}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please request a new password reset to continue.
          </Typography>
        </Alert>

        <Button
          variant="outlined"
          href="/forgot-password"
          sx={{ alignSelf: "center" }}
        >
          Request New Password Reset
        </Button>
      </Stack>
    )
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
        label="New Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoFocus
        disabled={loading || success}
        error={password.length > 0 && !validation.isValid}
        helperText={getFirstError}
        autoComplete="new-password"
      />

      {/* Password strength indicator */}
      <PasswordStrengthIndicator
        password={password}
        strength={validation.strength}
        showRequirements={true}
      />

      <TextField
        margin="normal"
        required
        label="Confirm New Password"
        type="password"
        value={passwordConfirmation}
        onChange={e => setPasswordConfirmation(e.target.value)}
        disabled={loading || success}
        error={!!confirmationError}
        helperText={confirmationError}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        disabled={
          loading ||
          success ||
          (password.length > 0 && !validation.isValid) ||
          !!confirmationError
        }
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </Button>

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Your password has been changed successfully! You can now log in with
            your new password.
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        <strong>Password Requirements:</strong> Must be at least 8 characters
        long and contain both letters and numbers. Special characters and longer
        passwords provide additional security.
      </Typography>
    </Stack>
  )
}
