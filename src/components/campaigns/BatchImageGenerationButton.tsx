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
import { isBatchImageGenerating } from "@/types"

interface BatchImageGenerationButtonProps {
  campaign: Campaign
}

export default function BatchImageGenerationButton({
  campaign,
}: BatchImageGenerationButtonProps) {
  const { client } = useClient()
  const { toastSuccess, toastError, toastInfo } = useToast()
  const [loading, setLoading] = useState(false)

  // Check if batch generation is already in progress
  const isInProgress = isBatchImageGenerating(campaign)

  const handleGenerateBatchImages = async () => {
    if (loading || isInProgress) return

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
          loading || isInProgress ? (
            <CircularProgress size={20} />
          ) : (
            <AutoFixHigh />
          )
        }
        onClick={handleGenerateBatchImages}
        disabled={loading || isInProgress}
        sx={{ minWidth: 200 }}
      >
        {isInProgress
          ? "Generating..."
          : loading
            ? "Starting..."
            : "Generate Missing Images"}
      </Button>
      {isInProgress && progress !== null && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary">
            {campaign.batch_images_completed || 0} /{" "}
            {campaign.batch_images_total} images generated
          </Typography>
        </Box>
      )}
    </Box>
  )
}
