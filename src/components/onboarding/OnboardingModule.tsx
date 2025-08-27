"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Box, Paper, Slide, IconButton } from "@mui/material"
import { Close } from "@mui/icons-material"
import { OnboardingProgress } from "@/lib/onboarding"
import { CampaignOnboarding } from "./CampaignOnboarding"
import { OnboardingCarousel } from "./OnboardingCarousel"
import { CongratulationsModule } from "./CongratulationsModule"
import { useClient, useToast, useApp } from "@/contexts"

export interface OnboardingModuleProps {
  user: {
    onboarding_progress: OnboardingProgress
  }
}

export const OnboardingModule: React.FC<OnboardingModuleProps> = ({ user }) => {
  const pathname = usePathname()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { refreshUser } = useApp()
  const { onboarding_progress } = user
  if (!onboarding_progress) return

  const handleDismissOnboarding = async () => {
    try {
      // Debug logging
      console.log("Onboarding progress state:", {
        first_campaign_created_at:
          onboarding_progress.first_campaign_created_at,
        ready_for_congratulations:
          onboarding_progress.ready_for_congratulations,
        onboarding_complete: onboarding_progress.onboarding_complete,
        all_milestones_complete: onboarding_progress.all_milestones_complete,
      })

      // Determine which field to set based on which module is currently displayed
      let dismissField = "congratulations_dismissed_at" // Default

      // Check which module is being shown (using same logic as the render conditions)
      if (!onboarding_progress.first_campaign_created_at) {
        // CampaignOnboarding module is shown - dismiss by completing campaign creation step
        dismissField = "first_campaign_created_at"
        console.log(
          "Dismissing CampaignOnboarding module by setting first_campaign_created_at"
        )
      } else if (onboarding_progress.ready_for_congratulations) {
        // CongratulationsModule is shown - dismiss congratulations
        dismissField = "congratulations_dismissed_at"
        console.log(
          "Dismissing CongratulationsModule by setting congratulations_dismissed_at"
        )
      } else {
        // OnboardingCarousel is shown - dismiss current milestone or entire onboarding
        if (onboarding_progress.next_milestone?.timestamp_field) {
          // Dismiss current milestone by setting its timestamp field
          dismissField = onboarding_progress.next_milestone.timestamp_field
          console.log(
            `Dismissing current milestone (${onboarding_progress.next_milestone.key}) by setting ${dismissField}`
          )
        } else {
          // No specific milestone, dismiss entire onboarding
          dismissField = "congratulations_dismissed_at"
          console.log(
            "Dismissing entire onboarding by setting congratulations_dismissed_at"
          )
        }
      }

      console.log(`Setting ${dismissField} to dismiss onboarding`)

      await client.updateOnboardingProgress({
        [dismissField]: new Date().toISOString(),
      })
      toastSuccess("Onboarding dismissed! You&apos;re all set!")
      await refreshUser()
    } catch (error) {
      console.error("Failed to dismiss onboarding:", error)
      toastError("Failed to dismiss onboarding. Please try again.")
    }
  }

  // Don't show anything if onboarding is complete
  if (onboarding_progress.onboarding_complete) {
    return null
  }

  // Reusable dismiss button component
  const DismissButton = () => (
    <IconButton
      onClick={handleDismissOnboarding}
      sx={{
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "grey.300",
        zIndex: 1,
        "&:hover": {
          backgroundColor: "grey.50",
        },
      }}
      size="small"
      title="Dismiss onboarding"
    >
      <Close fontSize="small" />
    </IconButton>
  )

  // Show congratulations if all milestones complete but not dismissed
  if (onboarding_progress.ready_for_congratulations) {
    return (
      <Slide in={true} direction="down" timeout={500}>
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 2,
              border: "2px solid",
              borderColor: "success.main",
              backgroundColor: "success.50",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <DismissButton />
            <CongratulationsModule />
          </Paper>
        </Box>
      </Slide>
    )
  }

  // Show single CTA for pre-campaign users
  if (!onboarding_progress.first_campaign_created_at) {
    return (
      <Slide in={true} direction="down" timeout={500}>
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 2,
              border: "2px solid",
              borderColor: "primary.main",
              backgroundColor: "primary.50",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <DismissButton />
            <CampaignOnboarding currentPath={pathname} />
          </Paper>
        </Box>
      </Slide>
    )
  }

  // Show carousel for post-campaign users
  return (
    <Slide in={true} direction="down" timeout={500}>
      <Box sx={{ p: 2 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 2,
            border: "2px solid",
            borderColor: "info.main",
            backgroundColor: "info.50",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
              animation: "onboarding-shimmer 3s infinite",
              pointerEvents: "none",
            },
            "@keyframes onboarding-shimmer": {
              "0%": { transform: "translateX(-100%)" },
              "100%": { transform: "translateX(100%)" },
            },
          }}
        >
          <DismissButton />
          <OnboardingCarousel
            progress={onboarding_progress}
            currentPath={pathname}
          />
        </Paper>
      </Box>
    </Slide>
  )
}
