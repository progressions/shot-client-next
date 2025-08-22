"use client"

import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Alert,
  FormHelperText,
} from "@mui/material"
import { Button } from "@/components/ui"
import { useClient } from "@/contexts"
import { useForm, FormActions } from "@/reducers/formState"
import { Invitation, HttpError } from "@/types"

interface InvitationRegistrationFormProps {
  invitation: Invitation
  onSuccess: (message: string) => void
  onError: (error: string) => void
}

interface RegistrationFormData {
  first_name: string
  last_name: string
  password: string
  password_confirmation: string
}

export default function InvitationRegistrationForm({
  invitation,
  onSuccess,
  onError,
}: InvitationRegistrationFormProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<RegistrationFormData>({
    first_name: "",
    last_name: "",
    password: "",
    password_confirmation: "",
  })

  const handleInputChange = (field: string, value: string) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: field,
      value: value,
    })
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!formState.data.first_name.trim()) {
      errors.first_name = "First name is required"
    }

    if (!formState.data.last_name.trim()) {
      errors.last_name = "Last name is required"
    }

    if (!formState.data.password) {
      errors.password = "Password is required"
    } else if (formState.data.password.length < 8) {
      errors.password = "Password must be at least 8 characters long"
    } else if (!/[a-zA-Z]/.test(formState.data.password)) {
      errors.password = "Password must contain letters"
    } else if (!/[0-9]/.test(formState.data.password)) {
      errors.password = "Password must contain numbers"
    }

    if (formState.data.password !== formState.data.password_confirmation) {
      errors.password_confirmation = "Passwords do not match"
    }

    if (Object.keys(errors).length > 0) {
      dispatchForm({
        type: FormActions.ERRORS,
        payload: errors,
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    dispatchForm({ type: FormActions.SUBMIT })

    try {
      const response = await client.registerInvitation(
        invitation,
        formState.data
      )

      dispatchForm({
        type: FormActions.SUCCESS,
        payload:
          response.data.message ||
          "Account created! Please check your email to confirm your account and join the campaign.",
      })

      onSuccess(
        response.data.message ||
          "Account created! Please check your email to confirm your account and join the campaign."
      )
    } catch (error) {
      const httpError = error as HttpError
      console.error("Registration error:", httpError)

      if (httpError.response?.status === 422) {
        const errorData = httpError.response.data

        if (errorData.has_account) {
          onError(
            "An account already exists with this email address. Please log in instead."
          )
          return
        }

        if (errorData.errors) {
          dispatchForm({
            type: FormActions.ERRORS,
            payload: errorData.errors,
          })
          return
        }
      }

      const errorMessage =
        httpError.response?.data?.error ||
        "Failed to create account. Please try again."

      // Handle single error message from backend validation
      if (httpError.response?.data?.field) {
        const field = httpError.response.data.field
        dispatchForm({
          type: FormActions.ERRORS,
          payload: { [field]: errorMessage },
        })
      } else {
        dispatchForm({
          type: FormActions.ERRORS,
          payload: { general: errorMessage },
        })
        onError(errorMessage)
      }
    }
  }

  return (
    <Paper sx={{ p: 4, width: "100%" }}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Join {invitation.campaign?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your account to accept this invitation. You&apos;ll receive a
            confirmation email to complete the process.
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Invited to: <strong>{invitation.email}</strong>
          </Typography>
        </Box>

        {formState.errors.general && (
          <Alert severity="error">{formState.errors.general}</Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="First Name"
              value={formState.data.first_name}
              onChange={e => handleInputChange("first_name", e.target.value)}
              error={!!formState.errors.first_name}
              required
              fullWidth
              disabled={formState.saving}
            />
            {formState.errors.first_name && (
              <FormHelperText error sx={{ mt: -1 }}>
                {formState.errors.first_name}
              </FormHelperText>
            )}

            <TextField
              label="Last Name"
              value={formState.data.last_name}
              onChange={e => handleInputChange("last_name", e.target.value)}
              error={!!formState.errors.last_name}
              required
              fullWidth
              disabled={formState.saving}
            />
            {formState.errors.last_name && (
              <FormHelperText error sx={{ mt: -1 }}>
                {formState.errors.last_name}
              </FormHelperText>
            )}

            <TextField
              label="Password"
              type="password"
              value={formState.data.password}
              onChange={e => handleInputChange("password", e.target.value)}
              error={!!formState.errors.password}
              helperText={
                !formState.errors.password
                  ? "Minimum 8 characters with letters and numbers"
                  : undefined
              }
              required
              fullWidth
              disabled={formState.saving}
            />
            {formState.errors.password && (
              <FormHelperText error sx={{ mt: -1 }}>
                {formState.errors.password}
              </FormHelperText>
            )}

            <TextField
              label="Confirm Password"
              type="password"
              value={formState.data.password_confirmation}
              onChange={e =>
                handleInputChange("password_confirmation", e.target.value)
              }
              error={!!formState.errors.password_confirmation}
              required
              fullWidth
              disabled={formState.saving}
            />
            {formState.errors.password_confirmation && (
              <FormHelperText error sx={{ mt: -1 }}>
                {formState.errors.password_confirmation}
              </FormHelperText>
            )}

            <Button
              type="submit"
              size="large"
              disabled={formState.saving}
              sx={{ mt: 2 }}
            >
              {formState.saving ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating Account...
                </>
              ) : (
                "Create Account & Join Campaign"
              )}
            </Button>
          </Stack>
        </form>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Button
              variant="text"
              size="small"
              onClick={() =>
                (window.location.href = `/login?redirect=/redeem/${invitation.id}`)
              }
              disabled={formState.saving}
            >
              Sign in instead
            </Button>
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}
