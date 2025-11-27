"use client"

import React, { useRef, useState, useCallback } from "react"
import { Box, IconButton, Popover } from "@mui/material"
import { ChevronLeft, ChevronRight } from "@mui/icons-material"
import { EntityAvatar } from "@/components/avatars"
import { CharacterPopup } from "@/components/popups"
import type { Shot, Character } from "@/types"
import { getAllVisibleShots } from "@/components/encounters/attacks/shotSorting"

interface ShotCarouselProps {
  shots: Shot[]
  currentShot?: number | null
}

export default function ShotCarousel({
  shots,
  currentShot,
}: ShotCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Popup state
  const [popupAnchorEl, setPopupAnchorEl] = useState<HTMLElement | null>(null)
  const [popupCharacterId, setPopupCharacterId] = useState<string | null>(null)
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeouts on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current)
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])
  // Get visible shots and group by shot number
  const visibleShots = getAllVisibleShots(shots)

  // Group shots by shot number, sorted descending
  const shotGroups = React.useMemo(() => {
    const groups = new Map<number, Shot[]>()

    visibleShots.forEach(shot => {
      const shotNumber = shot.shot
      if (shotNumber === null || shotNumber === undefined) return

      if (!groups.has(shotNumber)) {
        groups.set(shotNumber, [])
      }
      groups.get(shotNumber)!.push(shot)
    })

    // Sort by shot number descending (highest first)
    return Array.from(groups.entries()).sort(([a], [b]) => b - a)
  }, [visibleShots])

  // Check scroll position and update button states
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  // Scroll handlers
  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: -200, behavior: "smooth" })
  }, [])

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: 200, behavior: "smooth" })
  }, [])

  // Popup handlers
  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLElement>, characterId: string) => {
      // Clear any pending close timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }

      // Store the element reference before the timeout (currentTarget becomes null after event)
      const targetElement = event.currentTarget

      // Set a delay before showing the popup
      popupTimeoutRef.current = setTimeout(() => {
        setPopupAnchorEl(targetElement)
        setPopupCharacterId(characterId)
      }, 300)
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    // Clear any pending open timeout
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current)
      popupTimeoutRef.current = null
    }

    // Set a delay before closing the popup
    closeTimeoutRef.current = setTimeout(() => {
      setPopupAnchorEl(null)
      setPopupCharacterId(null)
    }, 200)
  }, [])

  const handlePopupMouseEnter = useCallback(() => {
    // Keep popup open when hovering over it
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const handlePopupMouseLeave = useCallback(() => {
    // Close popup when leaving it
    closeTimeoutRef.current = setTimeout(() => {
      setPopupAnchorEl(null)
      setPopupCharacterId(null)
    }, 200)
  }, [])

  const handleClose = useCallback(() => {
    setPopupAnchorEl(null)
    setPopupCharacterId(null)
  }, [])

  if (shotGroups.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: "background.paper",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        mb: 1,
      }}
    >
      {/* Left scroll button */}
      {canScrollLeft && (
        <IconButton
          onClick={scrollLeft}
          aria-label="Scroll left"
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            backgroundColor: "background.paper",
            boxShadow: 2,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          size="small"
        >
          <ChevronLeft />
        </IconButton>
      )}

      {/* Scrollable container */}
      <Box
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 0.5,
          overflowX: "auto",
          overflowY: "hidden",
          py: 1,
          px: { xs: 1, sm: 2 },
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          // Hide scrollbar but keep functionality
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {shotGroups.map(([shotNumber, shotsInGroup]) => (
          <React.Fragment key={`shot-group-${shotNumber}`}>
            {/* Shot number label */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 32,
                px: 0.5,
                height: 48,
                flexShrink: 0,
                fontWeight: "bold",
                color:
                  currentShot === shotNumber
                    ? "primary.main"
                    : "text.secondary",
                fontSize: "0.875rem",
                borderRadius: 1,
                backgroundColor:
                  currentShot === shotNumber
                    ? "action.selected"
                    : "transparent",
              }}
            >
              {shotNumber}
            </Box>

            {/* Characters at this shot */}
            {shotsInGroup.map(shot => {
              if (!shot.character) return null
              const character = shot.character as Character

              return (
                <Box
                  key={character.shot_id || character.id}
                  onMouseEnter={e => handleMouseEnter(e, character.id)}
                  onMouseLeave={handleMouseLeave}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: 1,
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <EntityAvatar
                    entity={character}
                    disablePopup={true}
                    sx={{
                      width: 40,
                      height: 40,
                    }}
                  />
                </Box>
              )
            })}
          </React.Fragment>
        ))}
      </Box>

      {/* Right scroll button */}
      {canScrollRight && (
        <IconButton
          onClick={scrollRight}
          aria-label="Scroll right"
          sx={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            backgroundColor: "background.paper",
            boxShadow: 2,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          size="small"
        >
          <ChevronRight />
        </IconButton>
      )}

      {/* Character popup */}
      <Popover
        open={Boolean(popupAnchorEl) && Boolean(popupCharacterId)}
        anchorEl={popupAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        disableRestoreFocus
        disableScrollLock
        sx={{ pointerEvents: "none" }}
        PaperProps={{
          sx: { maxWidth: "90vw", maxHeight: "50vh", overflow: "auto" },
        }}
      >
        <Box
          sx={{ px: 2, maxWidth: 400, pointerEvents: "auto" }}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          {popupCharacterId && <CharacterPopup id={popupCharacterId} />}
        </Box>
      </Popover>
    </Box>
  )
}
