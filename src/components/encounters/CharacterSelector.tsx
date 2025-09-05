"use client"

import React, { useState, useMemo } from "react"
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
  showShotNumbers?: boolean
  filterFunction?: (character: Character) => boolean
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
  showShotNumbers = true,
  filterFunction,
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

      // If showing all, bypass all filters
      if (showAll) return true

      const char = entity as Character

      // Apply custom filter function if provided
      if (filterFunction && !filterFunction(char)) {
        return false
      }

      // Apply character type filter if provided
      if (characterTypes && characterTypes.length > 0) {
        const charType = CS.type(char)
        if (!characterTypes.includes(charType as CharacterTypeFilter)) {
          return false
        }
      }

      return true
    })
  }, [shots, showAll, characterTypes, excludeShotId, filterFunction])

  // Group filtered shots by shot number for label display
  const shotGroups = useMemo(() => {
    const groups = new Map<number, Shot[]>()

    filteredShots.forEach(shot => {
      const shotNumber = shot.shot
      if (shotNumber === null || shotNumber === undefined) return

      if (!groups.has(shotNumber)) {
        groups.set(shotNumber, [])
      }
      groups.get(shotNumber)!.push(shot)
    })

    // Sort by shot number descending
    return Array.from(groups.entries()).sort(([a], [b]) => b - a)
  }, [filteredShots])

  return (
    <Box
      sx={{ opacity: disabled ? 0.5 : 1 }}
      data-testid="character-selector-container"
    >
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
        {shotGroups.map(([shotNumber, shotsInGroup]) => (
          <React.Fragment key={`shot-group-${shotNumber}`}>
            {/* Shot label */}
            {showShotNumbers && (
              <Box
                data-testid={`shot-label-${shotNumber}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "auto",
                  px: { xs: 1, sm: 2 },
                  height: { xs: 56, sm: 72 },
                  flexShrink: 0,
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  whiteSpace: "nowrap",
                }}
              >
                {shotNumber}
              </Box>
            )}

            {/* Characters at this shot */}
            {shotsInGroup.map(shot => {
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
                    e.stopPropagation()
                    // Toggle selection - if already selected, pass empty string to deselect
                    if (isSelected && !multiSelect) {
                      onSelect("")
                    } else {
                      onSelect(entity.shot_id || "")
                    }
                  }}
                  onMouseDown={e => {
                    // Prevent middle click from opening in new tab
                    if (e.button === 1) {
                      e.preventDefault()
                    }
                  }}
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: { xs: 60, sm: 80 },
                    width: { xs: 60, sm: 80 },
                    height: { xs: 56, sm: 72 },
                    flexShrink: 0, // Prevent shrinking
                    borderRadius: 2,
                    border: isSelected ? "3px solid" : "3px solid transparent",
                    borderColor: isSelected ? borderColor : "transparent",
                    backgroundColor: isSelected
                      ? "action.selected"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                    pl: { xs: 0.5, sm: 1 },
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
                      "& a": {
                        pointerEvents: "none",
                      },
                    }}
                  >
                    <Avatar
                      entity={entity}
                      href={`/characters/${entity.id}`}
                      disablePopup={isMobile}
                      disableImageViewer={true}
                      sx={{
                        width: { xs: 48, sm: 64 },
                        height: { xs: 48, sm: 64 },
                        ml: { xs: 0.25, sm: 0.5 },
                      }}
                    />
                  </Box>
                </Box>
              )
            })}
          </React.Fragment>
        ))}
      </Box>
      {showAllCheckbox &&
        ((characterTypes && characterTypes.length > 0) || filterFunction) && (
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
