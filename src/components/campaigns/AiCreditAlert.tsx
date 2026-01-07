"use client"

import { useState } from "react"
import { Alert, AlertTitle, Box, Button, CircularProgress } from "@mui/material"
import type { Campaign } from "@/types"
import { isAiCreditsExhausted } from "@/types"
import { useClient, useToast, useApp, useCampaign } from "@/contexts"

interface AiCreditAlertProps {
  campaign: Campaign
}

/**
 * Formats the AI provider name for display
 */
function formatProviderName(provider: string | null | undefined): string {
  switch (provider) {
    case "grok":
      return "Grok"
    case "openai":
      return "OpenAI"
    case "gemini":
      return "Gemini"
    default:
      return "AI provider"
  }
}

export default function AiCreditAlert({ campaign }: AiCreditAlertProps) {
  const [loading, setLoading] = useState(false)
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { user } = useApp()
  const { setCurrentCampaign } = useCampaign()

  if (!isAiCreditsExhausted(campaign)) return null

  const isGamemaster = user?.id === campaign.gamemaster?.id
  const providerName = formatProviderName(
    campaign.ai_credits_exhausted_provider
  )

  const handleDismiss = async () => {
    setLoading(true)
    try {
      await client.resetGrokCredits(campaign.id)
      // Fetch fresh campaign data and set as current
      const updatedCampaign = await client.getCampaign(campaign.id)
      await setCurrentCampaign(updatedCampaign.data)
      toastSuccess("Credit exhaustion warning dismissed")
    } catch (error) {
      console.error("Failed to dismiss AI credit alert:", error)
      toastError("Failed to dismiss warning")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        action={
          isGamemaster && (
            <Button
              color="inherit"
              size="small"
              onClick={handleDismiss}
              disabled={loading}
              aria-label="Dismiss credit exhaustion warning"
              startIcon={
                loading ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              {loading ? "Dismissing..." : "Dismiss"}
            </Button>
          )
        }
      >
        <AlertTitle>AI Image Generation Unavailable</AlertTitle>
        {providerName} API credits are exhausted. AI image generation is
        temporarily disabled. Credits typically refresh monthly.
      </Alert>
    </Box>
  )
}
