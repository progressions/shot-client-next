"use client"

import { useState, useMemo } from "react"
import {
  Box,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Avatar } from "@/components/avatars"
import type { Shot, Character } from "@/types"
import { CS } from "@/services"

type CharacterTypeFilter =
  | "PC"
  | "Ally"
  | "Mook"
  | "Featured Foe"
  | "Boss"
  | "Uber-Boss"

interface CharacterSelectorProps {
  shots: Shot[]
  selectedShotId?: string
  selectedShotIds?: string[]
  onSelect: (shotId: string) => void
  borderColor?: string
  disabled?: boolean
  characterTypes?: CharacterTypeFilter[]
  showAllCheckbox?: boolean
  excludeShotId?: string
  multiSelect?: boolean
}

export default function CharacterSelector({
  shots,
  selectedShotId,
  selectedShotIds = [],
  onSelect,
  borderColor = "primary.main",
  disabled = false,
  characterTypes,
  showAllCheckbox = false,
  excludeShotId,
  multiSelect = false,
}: CharacterSelectorProps) {
  const [showAll, setShowAll] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const filteredShots = useMemo(() => {
    return shots.filter(shot => {
      const entity = shot.character
      if (!entity) return false

      // Exclude specific shot if provided
      if (excludeShotId && entity.shot_id === excludeShotId) return false

      // If showing all or no filter specified, include all
      if (showAll || !characterTypes || characterTypes.length === 0) return true

      // Filter by character types - use CS.type to get the properly formatted type
      const char = entity as Character
      const charType = CS.type(char)
      return characterTypes.includes(charType as CharacterTypeFilter)
    })
  }, [shots, showAll, characterTypes, excludeShotId])

  return (
    <Box sx={{ opacity: disabled ? 0.5 : 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 0.1, // Minimal gap between items
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
        {filteredShots.map(shot => {
          const entity = shot.character || shot.vehicle
          if (!entity) return null
          const isSelected = multiSelect
            ? selectedShotIds.includes(entity.shot_id || "")
            : entity.shot_id === selectedShotId

          return (
            <Box
              key={entity.shot_id}
              onClick={e => {
                // Only prevent default and set selection if clicking on the box itself, not the popup
                if ((e.target as HTMLElement).closest(".MuiPopover-root")) {
                  return // Allow clicks in popup to work normally
                }
                e.preventDefault()
                // Toggle selection - if already selected, pass empty string to deselect
                if (isSelected && !multiSelect) {
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
                minWidth: 80, // Use minWidth instead of width
                width: 80,
                height: 72,
                flexShrink: 0, // Prevent shrinking
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
                  disablePopup={isMobile}
                  disableImageViewer={true}
                  sx={{
                    width: 64,
                    height: 64,
                    ml: 0.5,
                  }}
                />
              </Box>
            </Box>
          )
        })}
      </Box>
      {showAllCheckbox && characterTypes && characterTypes.length > 0 && (
        <FormControlLabel
          control={
            <Checkbox
              checked={showAll}
              onChange={e => setShowAll(e.target.checked)}
              size="small"
              disabled={disabled}
            />
          }
          label="Show all characters"
          sx={{
            mt: 0.5,
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
      )}
    </Box>
  )
}
