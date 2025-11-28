"use client"

import { useState, useCallback } from "react"
import {
  Box,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  CircularProgress,
} from "@mui/material"
import { Icon, SectionHeader } from "@/components/ui"
import { useClient, useToast, useApp } from "@/contexts"
import {
  ONBOARDING_MILESTONES,
  getCompletionPercentage,
} from "@/lib/onboarding"

export default function OnboardingMilestonesForm() {
  const { client, user } = useClient()
  const { refreshUser } = useApp()
  const { toastSuccess, toastError } = useToast()
  const [loadingField, setLoadingField] = useState<string | null>(null)

  const progress = user?.onboarding_progress

  const handleToggle = useCallback(
    async (timestampField: string, currentValue: string | undefined) => {
      if (!progress) return

      setLoadingField(timestampField)

      try {
        // If currently set, clear it (set to null). If not set, set to now.
        const newValue = currentValue ? null : new Date().toISOString()

        await client.updateOnboardingProgress({
          [timestampField]: newValue,
        })

        await refreshUser()
        toastSuccess(
          newValue ? "Milestone marked as complete" : "Milestone cleared"
        )
      } catch (error) {
        console.error("Failed to update milestone:", error)
        toastError("Failed to update milestone")
      } finally {
        setLoadingField(null)
      }
    },
    [client, progress, refreshUser, toastSuccess, toastError]
  )

  if (!progress) {
    return null
  }

  const completionPercentage = getCompletionPercentage(progress)

  return (
    <Box sx={{ mb: 4 }}>
      <SectionHeader
        title="Onboarding Progress"
        icon={<Icon keyword="Onboarding" />}
        sx={{ mb: 2 }}
      >
        Track your onboarding milestones. Toggle to manually complete or reset
        each step.
      </SectionHeader>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Completion: {completionPercentage}%
          </Typography>
          <Box
            sx={{
              mt: 1,
              height: 8,
              bgcolor: "grey.200",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${completionPercentage}%`,
                bgcolor: "primary.main",
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>

        <Stack spacing={1}>
          {ONBOARDING_MILESTONES.map(milestone => {
            const value = progress[milestone.timestampField] as
              | string
              | undefined
            const isComplete = !!value
            const isLoading = loadingField === milestone.timestampField

            return (
              <Box
                key={milestone.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1,
                  px: 1,
                  borderRadius: 1,
                  bgcolor: isComplete ? "success.50" : "transparent",
                  "&:hover": {
                    bgcolor: isComplete ? "success.100" : "action.hover",
                  },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      textDecoration: isComplete ? "line-through" : "none",
                      color: isComplete ? "text.secondary" : "text.primary",
                    }}
                  >
                    {milestone.title.replace(/^[^\s]+\s/, "")}
                  </Typography>
                  {isComplete && value && (
                    <Typography variant="caption" color="text.secondary">
                      Completed: {new Date(value).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isComplete}
                          onChange={() =>
                            handleToggle(milestone.timestampField, value)
                          }
                          disabled={isLoading}
                        />
                      }
                      label=""
                      sx={{ mr: 0 }}
                    />
                  )}
                </Box>
              </Box>
            )
          })}
        </Stack>

        {progress.congratulations_dismissed_at && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              Congratulations dismissed:{" "}
              {new Date(
                progress.congratulations_dismissed_at
              ).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
