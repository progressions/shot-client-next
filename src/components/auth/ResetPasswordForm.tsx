"use client"

import { useState, useEffect } from "react"
import {
  Stack,
  Alert,
  Typography,
  FormHelperText,
  LinearProgress,
  Box,
} from "@mui/material"
import { Button, TextField } from "@/components/ui"

interface ResetPasswordFormProps {
  token: string
  onSubmit: (password: string, passwordConfirmation: string) => Promise<void>
  loading?: boolean
  error?: string | null
  success?: boolean
  tokenValid?: boolean
  tokenExpired?: boolean
}

interface PasswordStrength {
  score: number
  message: string
  color: "error" | "warning" | "success"
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
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null
  )
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    message: "",
    color: "error",
  })

  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) {
      return { score: 0, message: "", color: "error" }
    }

    let score = 0
    const issues = []

    // Length check (minimum 8 characters)
    if (password.length >= 8) {
      score += 25
    } else {
      issues.push("at least 8 characters")
    }

    // Letters check
    if (/[a-zA-Z]/.test(password)) {
      score += 25
    } else {
      issues.push("letters")
    }

    // Numbers check
    if (/\d/.test(password)) {
      score += 25
    } else {
      issues.push("numbers")
    }

    // Additional complexity bonus
    if (password.length >= 12) score += 10
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) score += 15

    // Determine message and color
    let message = ""
    let color: "error" | "warning" | "success" = "error"

    if (score < 50) {
      message =
        issues.length > 0
          ? `Password must contain ${issues.join(", ")}`
          : "Password is too weak"
      color = "error"
    } else if (score < 75) {
      message = "Password strength: Good"
      color = "warning"
    } else {
      message = "Password strength: Strong"
      color = "success"
    }

    return { score: Math.min(score, 100), message, color }
  }

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return false
    }

    if (!/[a-zA-Z]/.test(password)) {
      setPasswordError("Password must contain letters")
      return false
    }

    if (!/\d/.test(password)) {
      setPasswordError("Password must contain numbers")
      return false
    }

    setPasswordError(null)
    return true
  }

  const validatePasswordConfirmation = (
    password: string,
    confirmation: string
  ): boolean => {
    if (confirmation && password !== confirmation) {
      setConfirmationError("Password confirmation doesn't match password")
      return false
    }

    setConfirmationError(null)
    return true
  }

  useEffect(() => {
    const strength = checkPasswordStrength(password)
    setPasswordStrength(strength)

    if (password) {
      validatePassword(password)
    }

    if (passwordConfirmation) {
      validatePasswordConfirmation(password, passwordConfirmation)
    }
  }, [password, passwordConfirmation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isPasswordValid = validatePassword(password)
    const isConfirmationValid = validatePasswordConfirmation(
      password,
      passwordConfirmation
    )

    if (!isPasswordValid || !isConfirmationValid) {
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
        error={!!passwordError}
        helperText={passwordError}
        autoComplete="new-password"
      />

      {password && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={passwordStrength.score}
            color={passwordStrength.color}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <FormHelperText
            sx={{ color: `${passwordStrength.color}.main`, mt: 0.5 }}
          >
            {passwordStrength.message}
          </FormHelperText>
        </Box>
      )}

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
          !!passwordError ||
          !!confirmationError ||
          passwordStrength.score < 50
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
