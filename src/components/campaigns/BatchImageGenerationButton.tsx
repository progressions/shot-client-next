"use client"

import { useState } from "react"
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
} from "@mui/material"
import { AutoFixHigh } from "@mui/icons-material"
import { useClient, useToast } from "@/contexts"
import type { Campaign } from "@/types"
import {
  isBatchImageGenerating,
  isAiCreditsExhausted,
  isAiGenerationEnabled,
} from "@/types"

interface BatchImageGenerationButtonProps {
  campaign: Campaign
}

export default function BatchImageGenerationButton({
  campaign,
}: BatchImageGenerationButtonProps) {
  const { client } = useClient()
  const { toastSuccess, toastError, toastInfo } = useToast()
  const [loading, setLoading] = useState(false)

  // Check if AI generation is enabled for this campaign
  const aiEnabled = isAiGenerationEnabled(campaign)

  // Check if batch generation is already in progress
  const isInProgress = isBatchImageGenerating(campaign)

  // Check if credits are exhausted
  const creditsExhausted = isAiCreditsExhausted(campaign)

  // Determine if generation is paused due to credit exhaustion
  const isPaused = isInProgress && creditsExhausted

  const handleGenerateBatchImages = async () => {
    if (loading || isInProgress || creditsExhausted || !aiEnabled) return

    setLoading(true)
    try {
      const response = await client.generateBatchImages(campaign.id)
      const { message, total_entities } = response.data

      if (total_entities === 0) {
        toastInfo(message)
      } else {
        toastSuccess(`${message}: ${total_entities} entities queued`)
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to start batch image generation"
      toastError(message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress percentage
  const progress =
    isInProgress && campaign.batch_images_total
      ? Math.round(
          ((campaign.batch_images_completed || 0) /
            campaign.batch_images_total) *
            100
        )
      : null

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Generate AI images for all entities (characters, sites, factions,
        parties, vehicles) that don&apos;t have images.
      </Typography>
      <Button
        variant="outlined"
        startIcon={
          loading || (isInProgress && !isPaused) ? (
            <CircularProgress size={20} />
          ) : (
            <AutoFixHigh />
          )
        }
        onClick={handleGenerateBatchImages}
        disabled={loading || isInProgress || creditsExhausted || !aiEnabled}
        sx={{ minWidth: 200 }}
      >
        {!aiEnabled
          ? "AI Disabled"
          : isPaused
            ? "Paused - Credits Exhausted"
            : isInProgress
              ? "Generating..."
              : loading
                ? "Starting..."
                : creditsExhausted
                  ? "Credits Exhausted"
                  : "Generate Missing Images"}
      </Button>
      {isInProgress && progress !== null && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={isPaused ? "warning" : "primary"}
          />
          <Typography
            variant="caption"
            color={isPaused ? "warning.main" : "text.secondary"}
          >
            {isPaused
              ? `Paused at ${campaign.batch_images_completed || 0} / ${campaign.batch_images_total} - credits exhausted`
              : `${campaign.batch_images_completed || 0} / ${campaign.batch_images_total} images generated`}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
