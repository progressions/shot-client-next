"use client"

import { 
  Box, 
  TextField, 
  Typography, 
  CircularProgress,
  Paper,
  Stack
} from "@mui/material"
import { Button } from "@/components/ui"
import { useClient } from "@/contexts"
import { useForm, FormActions } from "@/reducers/formState"
import { Invitation } from "@/types"

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
  onError 
}: InvitationRegistrationFormProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<RegistrationFormData>({
    first_name: "",
    last_name: "",
    password: "",
    password_confirmation: ""
  })

  const handleInputChange = (field: string, value: string) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: field,
      value: value
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
    } else if (formState.data.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    
    if (formState.data.password !== formState.data.password_confirmation) {
      errors.password_confirmation = "Passwords do not match"
    }
    
    if (Object.keys(errors).length > 0) {
      dispatchForm({
        type: FormActions.ERRORS,
        payload: errors
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
      const response = await client.registerInvitation(invitation, formState.data)
      
      dispatchForm({
        type: FormActions.SUCCESS,
        payload: response.data.message || "Account created! Please check your email to confirm your account and join the campaign."
      })
      
      onSuccess(response.data.message || "Account created! Please check your email to confirm your account and join the campaign.")
      
    } catch (error: any) {
      console.error("Registration error:", error)
      
      if (error.response?.status === 422) {
        const errorData = error.response.data
        
        if (errorData.has_account) {
          onError("An account already exists with this email address. Please log in instead.")
          return
        }
        
        if (errorData.errors) {
          dispatchForm({
            type: FormActions.ERRORS,
            payload: errorData.errors
          })
          return
        }
      }
      
      const errorMessage = error.response?.data?.error || "Failed to create account. Please try again."
      dispatchForm({
        type: FormActions.ERRORS,
        payload: errorMessage
      })
      onError(errorMessage)
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
            Create your account to accept this invitation. You'll receive a confirmation email to complete the process.
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Invited to: <strong>{invitation.email}</strong>
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="First Name"
              value={formState.data.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              error={!!formState.errors.first_name}
              helperText={formState.errors.first_name}
              required
              fullWidth
              disabled={formState.saving}
            />

            <TextField
              label="Last Name"
              value={formState.data.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              error={!!formState.errors.last_name}
              helperText={formState.errors.last_name}
              required
              fullWidth
              disabled={formState.saving}
            />

            <TextField
              label="Password"
              type="password"
              value={formState.data.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              error={!!formState.errors.password}
              helperText={formState.errors.password || "Minimum 6 characters"}
              required
              fullWidth
              disabled={formState.saving}
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={formState.data.password_confirmation}
              onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
              error={!!formState.errors.password_confirmation}
              helperText={formState.errors.password_confirmation}
              required
              fullWidth
              disabled={formState.saving}
            />

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
              onClick={() => window.location.href = `/login?redirect=/redeem/${invitation.id}`}
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