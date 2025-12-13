"use client"

import { useState } from "react"
import { Alert, AlertTitle, Box, Button, CircularProgress } from "@mui/material"
import type { Campaign } from "@/types"
import { isGrokCreditsExhausted } from "@/types"
import { useClient, useToast, useApp, useCampaign } from "@/contexts"

interface GrokCreditAlertProps {
  campaign: Campaign
}

export default function GrokCreditAlert({ campaign }: GrokCreditAlertProps) {
  const [loading, setLoading] = useState(false)
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { user } = useApp()
  const { setCurrentCampaign } = useCampaign()

  if (!isGrokCreditsExhausted(campaign)) return null

  const isGamemaster = user?.id === campaign.gamemaster?.id

  const handleDismiss = async () => {
    setLoading(true)
    try {
      await client.resetGrokCredits(campaign.id)
      // Refresh the campaign to get updated state
      await setCurrentCampaign(campaign)
      toastSuccess("Credit exhaustion warning dismissed")
    } catch (error) {
      console.error("Failed to dismiss grok credits:", error)
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
        Grok API credits are exhausted. AI image generation is temporarily
        disabled. Credits typically refresh monthly.
      </Alert>
    </Box>
  )
}
