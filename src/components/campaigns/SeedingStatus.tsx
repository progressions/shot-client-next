"use client"

import { Box, LinearProgress, Typography, Chip } from "@mui/material"
import { CheckCircle, HourglassEmpty, Sync } from "@mui/icons-material"
import type { Campaign } from "@/types"

interface SeedingStatusProps {
  campaign: Campaign
  variant?: "chip" | "banner" | "detailed"
}

const STAGE_LABELS: Record<string, string> = {
  schticks: "Adding schticks...",
  weapons: "Adding weapons...",
  factions: "Adding factions...",
  junctures: "Adding junctures...",
  characters: "Adding characters...",
  prerequisites: "Linking prerequisites...",
  images: "Copying images...",
  complete: "Complete",
}

export default function SeedingStatus({
  campaign,
  variant = "chip",
}: SeedingStatusProps) {
  const {
    seeding_status,
    is_seeding,
    is_seeded,
    seeding_images_total,
    seeding_images_completed,
  } = campaign

  // If seeding is complete (check status first to handle transition period)
  // When seeding_status is "complete", we're done even if is_seeded hasn't updated yet
  if (seeding_status === "complete" || (!is_seeding && is_seeded)) {
    if (variant === "chip") return null
    return (
      <Chip icon={<CheckCircle />} label="Ready" color="success" size="small" />
    )
  }

  // If no seeding status, nothing to show
  if (!seeding_status) return null

  const label = STAGE_LABELS[seeding_status] || seeding_status
  const imageProgress =
    seeding_status === "images" && seeding_images_total
      ? Math.round(
          ((seeding_images_completed || 0) / seeding_images_total) * 100
        )
      : null

  if (variant === "chip") {
    return (
      <Chip
        icon={
          <Sync
            sx={{
              animation: "spin 1s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
        }
        label={label}
        color="warning"
        size="small"
      />
    )
  }

  if (variant === "banner") {
    return (
      <Box
        sx={theme => ({
          p: 2,
          bgcolor: theme.palette.warning.dark,
          borderRadius: 1,
          mb: 2,
        })}
      >
        <Typography
          variant="body2"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <HourglassEmpty /> Setting up campaign: {label}
        </Typography>
        {imageProgress !== null && (
          <LinearProgress
            variant="determinate"
            value={imageProgress}
            sx={{ mt: 1 }}
          />
        )}
      </Box>
    )
  }

  // detailed variant - for modal
  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Sync
        sx={{
          fontSize: 48,
          animation: "spin 2s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
          color: "primary.main",
        }}
      />
      <Typography variant="h6" sx={{ mt: 2 }}>
        {label}
      </Typography>
      {imageProgress !== null && (
        <>
          <LinearProgress
            variant="determinate"
            value={imageProgress}
            sx={{ mt: 2, mx: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {seeding_images_completed} / {seeding_images_total} images
          </Typography>
        </>
      )}
    </Box>
  )
}
