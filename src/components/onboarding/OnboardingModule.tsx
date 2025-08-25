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
      await client.updateOnboardingProgress(onboarding_progress.id, {
        congratulations_dismissed_at: new Date().toISOString()
      })
      toastSuccess("Onboarding dismissed! You're all set!")
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
