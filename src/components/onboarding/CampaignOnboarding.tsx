"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Box, Typography, Button, Stack } from "@mui/material"
import { Campaign as CampaignIcon, ArrowForward } from "@mui/icons-material"
import { ONBOARDING_MILESTONES, isRelevantPage } from "@/lib/onboarding"

export interface CampaignOnboardingProps {
  currentPath: string
}

export const CampaignOnboarding: React.FC<CampaignOnboardingProps> = ({
  currentPath,
}) => {
  const router = useRouter()
  const campaignMilestone = ONBOARDING_MILESTONES[0] // Campaign is always first
  const isOnRelevantPage = isRelevantPage(campaignMilestone, currentPath)

  const handleCreateCampaign = () => {
    // If already on campaigns page, trigger drawer opening
    if (currentPath === "/campaigns") {
      // Dispatch custom event to open campaign creation drawer
      window.dispatchEvent(new CustomEvent("openCampaignDrawer"))
    } else {
      // Navigate to campaigns page
      router.push("/campaigns")
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "50%",
            backgroundColor: "primary.main",
            color: "white",
          }}
        >
          <CampaignIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box flex={1}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600, color: "primary.main" }}
          >
            {campaignMilestone.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {campaignMilestone.description} Click the button below to get
            started!
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
      >
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          onClick={handleCreateCampaign}
          data-testid="campaign-onboarding-cta"
          sx={{
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: "none",
            fontSize: "1.1rem",
            boxShadow: 3,
          }}
        >
          {isOnRelevantPage ? "Create Your First Campaign" : "Go to Campaigns"}
        </Button>

        {!isOnRelevantPage && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            You&rsquo;ll find the create button (⊕) when you get there!
          </Typography>
        )}
      </Stack>

      {isOnRelevantPage && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 1,
            backgroundColor: "warning.50",
            border: "1px solid",
            borderColor: "warning.200",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            💡 <strong>Tip:</strong> Look for the floating action button (⊕) at
            the bottom right of the page to create your campaign!
          </Typography>
        </Box>
      )}
    </Box>
  )
}
