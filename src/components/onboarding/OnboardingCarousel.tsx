"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  LinearProgress,
} from "@mui/material"
import {
  ArrowForward,
  ArrowBack,
  ArrowForwardIos,
  CheckCircle,
  Person,
  SportsKabaddi,
  Flag,
  Groups,
  LocationCity,
} from "@mui/icons-material"
import {
  OnboardingProgress,
  ONBOARDING_MILESTONES,
  getCompletedCount,
  getCompletionPercentage,
  isRelevantPage,
} from "@/lib/onboarding"
import { collectionNames } from "@/lib/maps"
import { useClient, useToast, useApp } from "@/contexts"

export interface OnboardingCarouselProps {
  progress: OnboardingProgress
  currentPath: string
}

const MILESTONE_ICONS: Record<string, React.ReactElement> = {
  "activate-campaign": (
    <CheckCircle sx={{ fontSize: 24, width: 24, height: 24 }} />
  ),
  character: <Person />,
  fight: <SportsKabaddi />,
  faction: <Flag />,
  party: <Groups />,
  site: <LocationCity />,
}

const getPluralName = (key: string): string => {
  const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1)
  const pluralForm = collectionNames[capitalizedKey]

  if (pluralForm) {
    // Capitalize the first letter of the plural form from maps
    return pluralForm.charAt(0).toUpperCase() + pluralForm.slice(1)
  }

  return `${capitalizedKey}s`
}

const getSingularName = (key: string): string => {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  progress,
  currentPath,
}) => {
  const router = useRouter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { refreshUser } = useApp()

  // Get remaining milestones (only show incomplete ones, but don't skip campaign creation by default)
  const remainingMilestones = ONBOARDING_MILESTONES.filter(
    milestone => !progress[milestone.timestampField]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentMilestone = remainingMilestones[currentIndex]

  if (!currentMilestone) {
    return null // All milestones complete
  }

  const completedCount = getCompletedCount(progress)
  const completionPercentage = getCompletionPercentage(progress)
  const isOnRelevantPage = isRelevantPage(currentMilestone, currentPath)

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex(Math.min(remainingMilestones.length - 1, currentIndex + 1))
  }

  const handleNavigateToMilestone = () => {
    const targetPage = currentMilestone.targetPages[0]

    // Special handling for character creation - always navigate to /characters/create
    if (currentMilestone.key === "character") {
      router.push("/characters/create")
      return
    }

    // If already on the relevant page, trigger drawer opening
    if (isOnRelevantPage) {
      const eventMap = {
        "activate-campaign": null, // Campaign activation doesn't use a drawer
        faction: "openFactionDrawer",
        fight: "openFightDrawer",
        party: "openPartyDrawer",
        site: "openSiteDrawer",
      }

      const eventName = eventMap[currentMilestone.key]
      if (eventName) {
        // Dispatch custom event to open the relevant creation drawer
        window.dispatchEvent(new CustomEvent(eventName))
      } else {
        // For milestones without drawer events, navigate normally
        router.push(targetPage)
      }
    } else {
      // Navigate to the target page
      router.push(targetPage)
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "info.main" }}>
            🎉 Great! Now build your world:
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress: {completedCount}/6 milestones
            </Typography>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "success.main",
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {completionPercentage}%
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ position: "relative", mb: 3 }}>
        {/* Navigation arrows */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <IconButton
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            size="small"
          >
            <ArrowBack />
          </IconButton>

          <Stack direction="row" spacing={1}>
            {remainingMilestones.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    index === currentIndex ? "info.main" : "grey.300",
                  cursor: "pointer",
                }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </Stack>

          <IconButton
            onClick={handleNext}
            disabled={currentIndex === remainingMilestones.length - 1}
            size="small"
          >
            <ArrowForwardIos />
          </IconButton>
        </Stack>

        {/* Current milestone */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1,
                borderRadius: "50%",
                backgroundColor: "info.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                minWidth: 48,
                minHeight: 48,
              }}
            >
              {MILESTONE_ICONS[currentMilestone.key] || (
                <CheckCircle sx={{ fontSize: 32 }} />
              )}
            </Box>

            <Box flex={1}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {currentMilestone.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {currentMilestone.description}
              </Typography>

              {currentMilestone.suggestedName && (
                <Chip
                  label={`Try: "${currentMilestone.suggestedName}"`}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ mt: 3 }}
        >
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleNavigateToMilestone}
            data-testid={`${currentMilestone.key}-onboarding-cta`}
            sx={{
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {currentMilestone.key === "activate-campaign"
              ? "Activate Campaign"
              : currentMilestone.key === "character"
                ? isOnRelevantPage
                  ? "Create Character"
                  : "Go to Characters"
                : isOnRelevantPage
                  ? `Create ${currentMilestone.key.charAt(0).toUpperCase() + currentMilestone.key.slice(1)}`
                  : `Go to ${getPluralName(currentMilestone.key)}`}
          </Button>

          {!isOnRelevantPage &&
            currentMilestone.key !== "activate-campaign" && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Look for the create button (⊕) when you get there!
              </Typography>
            )}

          {!isOnRelevantPage &&
            currentMilestone.key === "activate-campaign" && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Look for the "Activate" button on your Campaign!
              </Typography>
            )}
        </Stack>

        {isOnRelevantPage && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 1,
              backgroundColor: "info.50",
              border: "1px solid",
              borderColor: "info.200",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              🎯 <strong>You're here!</strong>{" "}
              {currentMilestone.key === "activate-campaign"
                ? 'Click the "Activate" button on your Campaign to activate it.'
                : currentMilestone.key === "character"
                  ? "Choose one of the character templates below to create your first Character."
                  : `Use the floating action button (⊕) at the bottom right to create your ${currentMilestone.key.charAt(0).toUpperCase() + currentMilestone.key.slice(1)}.`}
            </Typography>
          </Box>
        )}

        {/* Show completed milestones */}
        {completedCount > 1 && (
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              ✅ Completed:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {ONBOARDING_MILESTONES.filter(
                milestone => progress[milestone.timestampField]
              ).map(milestone => (
                <Chip
                  key={milestone.key}
                  label={
                    milestone.key === "activate-campaign"
                      ? "Campaign Active"
                      : getSingularName(milestone.key)
                  }
                  size="small"
                  color="success"
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  )
}
