"use client"

import { Box, Stack, Tooltip } from "@mui/material"
import { Avatar } from "@/components/avatars"
import type { Shot } from "@/types"

interface CharacterSelectorProps {
  shots: Shot[]
  selectedShotId: string
  onSelect: (shotId: string) => void
  borderColor?: string
  disabled?: boolean
}

export default function CharacterSelector({
  shots,
  selectedShotId,
  onSelect,
  borderColor = "primary.main",
  disabled = false,
}: CharacterSelectorProps) {
  return (
    <Box sx={{ mb: 3, opacity: disabled ? 0.5 : 1 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
          pb: 1,
          pointerEvents: disabled ? "none" : "auto",
          // Enable smooth scrolling
          scrollBehavior: "smooth",
          // Enable momentum scrolling on iOS
          WebkitOverflowScrolling: "touch",
          // Make sure horizontal scrolling works with trackpad
          "&::-webkit-scrollbar": {
            height: 6,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "action.hover",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "action.disabled",
            borderRadius: 3,
          },
        }}
      >
        {shots.map(shot => {
          const entity = shot.character || shot.vehicle
          if (!entity) return null
          const isSelected = entity.shot_id === selectedShotId

          return (
            <Tooltip
              key={entity.shot_id}
              title={isSelected ? "Click to deselect" : entity.name}
              arrow
            >
              <Box
                onClick={e => {
                  // Only prevent default and set selection if clicking on the box itself, not the popup
                  if ((e.target as HTMLElement).closest(".MuiPopover-root")) {
                    return // Allow clicks in popup to work normally
                  }
                  e.preventDefault()
                  // If clicking the already selected avatar, deselect it
                  if (isSelected) {
                    onSelect("")
                  } else {
                    onSelect(entity.shot_id || "")
                  }
                }}
                sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 72,
                borderRadius: 2,
                border: isSelected ? "3px solid" : "3px solid transparent",
                borderColor: isSelected ? borderColor : "transparent",
                backgroundColor: isSelected ? "action.selected" : "transparent",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                pl: 1,
                transition: "all 0.2s",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Avatar
                  entity={entity}
                  href={`/characters/${entity.id}`}
                  disableImageViewer={true}
                  sx={{
                    width: 64,
                    height: 64,
                    ml: 0.5,
                  }}
                />
              </Box>
            </Box>
          </Tooltip>
          )
        })}
      </Stack>
    </Box>
  )
}