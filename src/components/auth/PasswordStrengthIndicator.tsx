"use client"

import {
  Box,
  LinearProgress,
  FormHelperText,
  Stack,
  Typography,
} from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import {
  PasswordStrength,
  PASSWORD_REQUIREMENTS,
} from "@/hooks/usePasswordValidation"

interface PasswordStrengthIndicatorProps {
  password: string
  strength: PasswordStrength
  showRequirements?: boolean
}

/**
 * Visual indicator for password strength with optional requirements checklist
 *
 * Shows a progress bar that changes color based on password strength,
 * along with a message indicating the current strength level.
 *
 * Optionally displays a checklist of password requirements with
 * visual indicators for which requirements are met.
 */
export function PasswordStrengthIndicator({
  password,
  strength,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null
  }

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <LinearProgress
        variant="determinate"
        value={strength.score}
        color={strength.color}
        sx={{ height: 6, borderRadius: 3 }}
      />
      <FormHelperText sx={{ color: `${strength.color}.main`, mt: 0.5, mb: 1 }}>
        {strength.message}
      </FormHelperText>

      {showRequirements && (
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {PASSWORD_REQUIREMENTS.map(req => {
            const passed = req.test(password)
            return (
              <Stack
                key={req.id}
                direction="row"
                alignItems="center"
                spacing={0.5}
              >
                {passed ? (
                  <CheckCircleOutlineIcon
                    sx={{ fontSize: 16, color: "success.main" }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon
                    sx={{ fontSize: 16, color: "text.disabled" }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: passed ? "success.main" : "text.secondary",
                  }}
                >
                  {req.label}
                </Typography>
              </Stack>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
