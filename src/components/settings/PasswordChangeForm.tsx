"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Collapse,
} from "@mui/material"
import LockIcon from "@mui/icons-material/Lock"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import { Button, TextField } from "@/components/ui"
import { PasswordStrengthIndicator } from "@/components/auth"
import { useClient, useToast } from "@/contexts"
import { usePasswordValidation } from "@/hooks/usePasswordValidation"
import { AxiosError } from "axios"

interface PasswordChangeErrors {
  current_password?: string[]
  password?: string[]
  password_confirmation?: string[]
}

/**
 * PasswordChangeForm allows authenticated users to change their password
 * from the profile/settings page.
 *
 * Features:
 * - Current password verification
 * - New password strength indicator
 * - Password confirmation validation
 * - Collapsible form to save space
 *
 * @example
 * // In profile/settings page
 * <PasswordChangeForm />
 */
export function PasswordChangeForm() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState<PasswordChangeErrors | null>(
    null
  )

  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { validation, validateField, validateConfirmation } =
    usePasswordValidation()

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value)
    validateField(value)
    setServerErrors(null)
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    setServerErrors(null)
  }

  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value)
    setServerErrors(null)
  }

  const confirmationError = validateConfirmation(newPassword, confirmPassword)

  const isFormValid =
    currentPassword.length > 0 &&
    validation.isValid &&
    confirmPassword.length > 0 &&
    !confirmationError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) return

    setIsSubmitting(true)
    setServerErrors(null)

    try {
      await client.changePassword(currentPassword, newPassword, confirmPassword)
      toastSuccess("Password changed successfully")

      // Clear form on success
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setIsExpanded(false)
    } catch (err) {
      console.error("Failed to change password:", err)

      if (err instanceof AxiosError && err.response?.data?.errors) {
        setServerErrors(err.response.data.errors as PasswordChangeErrors)
      } else {
        toastError("Failed to change password")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setServerErrors(null)
    setIsExpanded(false)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LockIcon color="primary" />
          <Typography variant="h6">Change Password</Typography>
        </Box>
        <IconButton size="small">
          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Update your password to keep your account secure.
      </Typography>

      <Collapse in={isExpanded}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {serverErrors?.current_password && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverErrors.current_password[0]}
            </Alert>
          )}

          <TextField
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={e => handleCurrentPasswordChange(e.target.value)}
            error={!!serverErrors?.current_password}
            disabled={isSubmitting}
            fullWidth
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle current password visibility"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                    size="small"
                  >
                    {showCurrentPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={e => handleNewPasswordChange(e.target.value)}
            error={
              !!(
                serverErrors?.password ||
                (validation.errors.length > 0 && newPassword.length > 0)
              )
            }
            helperText={serverErrors?.password?.[0]}
            disabled={isSubmitting}
            fullWidth
            required
            sx={{ mb: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    size="small"
                  >
                    {showNewPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <PasswordStrengthIndicator
            password={newPassword}
            strength={validation.strength}
            showRequirements={true}
          />

          <TextField
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={e => handleConfirmPasswordChange(e.target.value)}
            error={!!(confirmationError || serverErrors?.password_confirmation)}
            helperText={
              confirmationError || serverErrors?.password_confirmation?.[0]
            }
            disabled={isSubmitting}
            fullWidth
            required
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              mt: 3,
            }}
          >
            <Button
              variant="text"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Changing..." : "Change Password"}
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default PasswordChangeForm
