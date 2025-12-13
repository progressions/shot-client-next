"use client"

import { Alert, AlertTitle, Box } from "@mui/material"
import type { Campaign } from "@/types"
import { isGrokCreditsExhausted } from "@/types"

interface GrokCreditAlertProps {
  campaign: Campaign
}

export default function GrokCreditAlert({ campaign }: GrokCreditAlertProps) {
  if (!isGrokCreditsExhausted(campaign)) return null

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="warning">
        <AlertTitle>AI Image Generation Unavailable</AlertTitle>
        Grok API credits are exhausted. AI image generation is temporarily
        disabled. Contact your administrator or wait for credits to refresh.
      </Alert>
    </Box>
  )
}
