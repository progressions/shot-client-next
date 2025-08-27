"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import {
  Close as CloseIcon,
  FitScreen as FitScreenIcon,
  ZoomOutMap as ZoomOutMapIcon,
} from "@mui/icons-material"
import type { Entity } from "@/types"

interface ImageViewerModalProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  altText?: string
  entity?: Entity
}

type DisplayMode = "fit" | "original"

export function ImageViewerModal({
  open,
  onClose,
  imageUrl,
  altText = "Image",
  entity,
}: ImageViewerModalProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("fit")
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  })

  // Reset states when modal opens with new image
  useEffect(() => {
    if (open && imageUrl) {
      setIsLoading(true)
      setHasError(false)
      setDisplayMode("fit")
    }
  }, [open, imageUrl])

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [open, onClose])

  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget
      setImageNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
      setIsLoading(false)
    },
    []
  )

  const handleImageError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  const handleDisplayModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: DisplayMode | null
  ) => {
    if (newMode !== null) {
      setDisplayMode(newMode)
    }
  }

  const handleBackdropClick = (event: React.MouseEvent) => {
    // Only close if clicking on the backdrop, not the image
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const getImageStyles = () => {
    const baseStyles = {
      display: isLoading ? "none" : "block",
      transition: "transform 0.25s ease-out",
    }

    if (displayMode === "fit") {
      return {
        ...baseStyles,
        maxWidth: "90vw",
        maxHeight: "90vh",
        width: "auto",
        height: "auto",
        objectFit: "contain" as const,
      }
    } else {
      // Original size mode
      return {
        ...baseStyles,
        width: "auto",
        height: "auto",
        maxWidth: "none",
        maxHeight: "none",
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "none",
          overflow: displayMode === "original" ? "auto" : "hidden",
        },
      }}
    >
      <DialogContent
        onClick={handleBackdropClick}
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          p: 0,
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
          },
        }}
      >
        {/* Close button */}
        <IconButton
          aria-label="Close image viewer"
          onClick={onClose}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Display mode toggle */}
        {!isLoading && !hasError && imageNaturalSize.width > 0 && (
          <ToggleButtonGroup
            value={displayMode}
            exclusive
            onChange={handleDisplayModeChange}
            aria-label="Display mode"
            sx={{
              position: "fixed",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 1,
            }}
          >
            <ToggleButton
              value="fit"
              aria-label="Fit to screen"
              sx={{
                color: "white",
                "&.Mui-selected": { color: "primary.main" },
              }}
            >
              <FitScreenIcon sx={{ mr: 0.5 }} />
              Fit to Screen
            </ToggleButton>
            <ToggleButton
              value="original"
              aria-label="Original size"
              sx={{
                color: "white",
                "&.Mui-selected": { color: "primary.main" },
              }}
            >
              <ZoomOutMapIcon sx={{ mr: 0.5 }} />
              Original Size
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <CircularProgress
            sx={{ color: "white" }}
            aria-label="Loading image"
          />
        )}

        {/* Error state */}
        {hasError && (
          <Box
            sx={{
              color: "white",
              textAlign: "center",
              p: 3,
            }}
          >
            <Box sx={{ fontSize: 48, mb: 2 }}>⚠️</Box>
            <Box>Failed to load image</Box>
            {entity?.name && (
              <Box sx={{ mt: 1, opacity: 0.7, fontSize: "0.9em" }}>
                {entity.name}
              </Box>
            )}
          </Box>
        )}

        {/* Image */}
        {imageUrl && !hasError && (
          <Box
            component="img"
            src={imageUrl}
            alt={altText || entity?.name || "Image"}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={getImageStyles()}
            onClick={e => e.stopPropagation()}
            role="img"
            aria-label={`Full size view of ${altText || entity?.name || "image"}`}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
