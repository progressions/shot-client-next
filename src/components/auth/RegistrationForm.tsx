"use client"

import { useState, useEffect } from "react"
import { Box, Stack, Alert, InputAdornment, IconButton } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { Button, TextField } from "@/components/ui"
import { useClient } from "@/contexts"
import { usePasswordValidation } from "@/hooks"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"
import type { RegistrationData } from "@/types/auth"

interface RegistrationFormProps {
  onSuccess: () => void
  onError?: (error: string) => void
}

export function RegistrationForm({
  onSuccess,
  onError,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    password_confirmation: "",
    first_name: "",
    last_name: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null
  )

  const { client } = useClient()
  const { validation, validateField, validateConfirmation } =
    usePasswordValidation()

  // Real-time validation as user types
  useEffect(() => {
    if (formData.password) {
      validateField(formData.password)
    }
  }, [formData.password, validateField])

  // Validate confirmation when either password changes
  useEffect(() => {
    if (formData.password_confirmation) {
      const error = validateConfirmation(
        formData.password,
        formData.password_confirmation
      )
      setConfirmationError(error)
    } else {
      setConfirmationError(null)
    }
  }, [formData.password, formData.password_confirmation, validateConfirmation])

  const handleChange =
    (field: keyof RegistrationData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value })
      // Clear field-specific errors when user starts typing
      if (errors[field]) {
        const newErrors = { ...errors }
        delete newErrors[field]
        setErrors(newErrors)
      }
      // Clear general error when user makes changes
      if (generalError) {
        setGeneralError(null)
      }
    }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Client-side validation before submission
    const clientErrors: Record<string, string[]> = {}

    if (!validation.isValid && formData.password) {
      clientErrors.password = validation.errors
    }

    if (confirmationError) {
      clientErrors.password_confirmation = [confirmationError]
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setLoading(true)
    setErrors({})
    setGeneralError(null)

    try {
      await client.registerUser(formData)
      onSuccess()
    } catch (error: unknown) {
      console.error("Registration error:", error)

      const axiosError = error as {
        response?: {
          status: number
          data: { errors?: Record<string, string[]>; message?: string }
        }
      }
      if (
        axiosError.response?.status === 422 &&
        axiosError.response?.data?.errors
      ) {
        // Handle validation errors from backend
        setErrors(axiosError.response.data.errors)
      } else if (axiosError.response?.data?.message) {
        // Handle other backend errors with specific messages
        setGeneralError(axiosError.response.data.message)
        onError?.(axiosError.response.data.message)
      } else {
        // Handle network or other errors
        const errorMessage = "Registration failed. Please try again."
        setGeneralError(errorMessage)
        onError?.(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const getFieldError = (field: string): string => {
    return errors[field]?.[0] || ""
  }

  const hasFieldError = (field: string): boolean => {
    return errors[field]?.length > 0
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.first_name}
            onChange={handleChange("first_name")}
            error={hasFieldError("first_name")}
            helperText={getFieldError("first_name")}
            disabled={loading}
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.last_name}
            onChange={handleChange("last_name")}
            error={hasFieldError("last_name")}
            helperText={getFieldError("last_name")}
            disabled={loading}
            required
          />
        </Stack>

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          error={hasFieldError("email")}
          helperText={getFieldError("email")}
          disabled={loading}
          required
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange("password")}
          error={hasFieldError("password")}
          helperText={getFieldError("password")}
          disabled={loading}
          required
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          slotProps={{
            input: {
              suppressHydrationWarning: true,
            },
          }}
        />

        {/* Password strength indicator */}
        <PasswordStrengthIndicator
          password={formData.password}
          strength={validation.strength}
          showRequirements={true}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type={showPasswordConfirmation ? "text" : "password"}
          value={formData.password_confirmation}
          onChange={handleChange("password_confirmation")}
          error={hasFieldError("password_confirmation") || !!confirmationError}
          helperText={
            getFieldError("password_confirmation") || confirmationError
          }
          disabled={loading}
          required
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowPasswordConfirmation(!showPasswordConfirmation)
                  }
                  edge="end"
                  disabled={loading}
                >
                  {showPasswordConfirmation ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          slotProps={{
            input: {
              suppressHydrationWarning: true,
            },
          }}
        />

        {/* General error message */}
        {generalError && <Alert severity="error">{generalError}</Alert>}

        {/* Validation errors summary */}
        {Object.keys(errors).length > 0 && !generalError && (
          <Alert severity="error">
            Please correct the errors above and try again.
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={
            loading ||
            (formData.password.length > 0 && !validation.isValid) ||
            !!confirmationError
          }
          sx={{ mt: 2 }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </Stack>
    </Box>
  )
}
