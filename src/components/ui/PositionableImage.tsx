"use client"

import type { Entity } from "@/types"
import { Box } from "@mui/material"
import { useState, useEffect, useRef } from "react"
import { UploadButton } from "./positionable/UploadButton"
import { ImageBox } from "./positionable/ImageBox"
import { GenerateButton } from "./positionable/GenerateButton"
import { RepositionButton } from "./positionable/RepositionButton"
import { SaveCancelMiniButtons } from "./positionable/SaveCancelMiniButtons"
import { DeleteButton } from "./positionable/DeleteButton"
import { ImageViewerModal } from "./ImageViewerModal"
import { GenerateImageDialog, UploadImageDialog } from "@/components/generate"
import { useToast } from "@/contexts/ToastContext"
import { useClient } from "@/contexts/AppContext"

/**
 * Props for the PositionableImage component.
 *
 * @property {Entity} entity - The entity (Character, Campaign, Site, etc.) whose image is being displayed.
 *   Must have `image_url`, `image_positions`, `id`, and `name` properties.
 * @property {(entity: Entity) => void} [setEntity] - Optional callback to update the entity state in the parent component.
 *   Used to sync image position changes back to parent state.
 * @property {"index" | "entity" | "edit"} pageContext - The context in which the image is displayed:
 *   - "index": List/grid view (typically smaller)
 *   - "entity": Detail/show page view
 *   - "edit": Edit form view
 * @property {number} [height=300] - The height of the image container in pixels.
 * @property {boolean} [isMobile=false] - Whether the component is being rendered on a mobile device.
 *   Affects the position context string (e.g., "mobile_entity" vs "desktop_entity").
 * @property {boolean} [creationMode=false] - Whether the entity is being created (not yet saved to backend).
 *   In creation mode, position changes are stored locally without API calls.
 * @property {(position: { x_position: number; y_position: number; context: string }) => void} [onPositionChange] -
 *   Optional callback fired when the image position changes. Used in creation mode to capture
 *   position data before the entity is saved.
 */
type PositionableImageProps = {
  entity: Entity
  setEntity?: (entity: Entity) => void
  pageContext: "index" | "entity" | "edit"
  height?: number
  isMobile?: boolean
  creationMode?: boolean
  onPositionChange?: (position: {
    x_position: number
    y_position: number
    context: string
  }) => void
}

/**
 * A responsive image component that supports drag-to-reposition functionality,
 * AI image generation, and image upload for game entities.
 *
 * This component displays an entity's image in a fixed-height container and provides
 * the following features:
 *
 * **Core Features:**
 * - **Image Display**: Shows the entity's image with configurable positioning
 * - **Drag-to-Reposition**: Users can drag the image to adjust its position within the viewport
 * - **Position Persistence**: Positions are saved per-context (desktop/mobile + index/entity/edit)
 * - **Image Upload**: Opens a dialog to upload a new image via ImageKit
 * - **AI Generation**: Opens a dialog to generate a new image using AI
 * - **Full-Size Viewer**: Click to open a modal with the full-size image
 *
 * **Positioning System:**
 * Each entity can have multiple saved positions based on the display context. The context
 * is computed as `{device}_{pageContext}` (e.g., "desktop_entity", "mobile_index").
 * This allows different crops/positions for different viewport sizes and page types.
 *
 * **Usage Modes:**
 * - **Normal Mode**: Position changes are saved to the backend via `client.updateImagePosition()`
 * - **Creation Mode**: Position changes are stored locally and reported via `onPositionChange`
 *   callback, since the entity doesn't have an ID yet
 *
 * @example
 * // Basic usage on a detail page
 * <PositionableImage
 *   entity={character}
 *   setEntity={setCharacter}
 *   pageContext="entity"
 * />
 *
 * @example
 * // Usage in a creation form
 * <PositionableImage
 *   entity={newCharacter}
 *   setEntity={setNewCharacter}
 *   pageContext="edit"
 *   creationMode={true}
 *   onPositionChange={(pos) => setFormData({ ...formData, imagePosition: pos })}
 * />
 *
 * @example
 * // Mobile-optimized with custom height
 * <PositionableImage
 *   entity={site}
 *   setEntity={setSite}
 *   pageContext="entity"
 *   height={200}
 *   isMobile={true}
 * />
 */
export function PositionableImage({
  entity,
  setEntity,
  pageContext = "entity",
  height,
  isMobile = false,
  creationMode = false,
  onPositionChange,
}: PositionableImageProps) {
  const { client } = useClient()
  const imgRef = useRef<HTMLImageElement>(null)
  const [boxWidth, setBoxWidth] = useState(0)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toastSuccess, toastError } = useToast()
  const context = `${isMobile ? "mobile" : "desktop"}_${pageContext}`
  const position = entity.image_positions?.find(
    pos => pos.context === context
  ) || { x_position: 0, y_position: 0 }

  // Initialize state from calculated position
  const [currentX, setCurrentX] = useState(() => position.x_position)
  const [currentY, setCurrentY] = useState(() => position.y_position)
  const [isDragging, setIsDragging] = useState(false)

  // Sync position state with entity data (but only when not actively repositioning or saving)
  useEffect(() => {
    if (!isRepositioning && !isDragging && !isSaving) {
      setCurrentX(position.x_position)
      setCurrentY(position.y_position)
    }
  }, [
    position.x_position,
    position.y_position,
    isRepositioning,
    isDragging,
    isSaving,
    entity.image_positions?.length,
  ])

  useEffect(() => {
    const updateBoxWidth = () => {
      if (imgRef.current?.parentElement) {
        setBoxWidth(imgRef.current.parentElement.clientWidth)
      }
    }
    updateBoxWidth()
    window.addEventListener("resize", updateBoxWidth)
    return () => window.removeEventListener("resize", updateBoxWidth)
  }, [])

  // Re-calculate box width when image URL changes
  useEffect(() => {
    if (entity.image_url && imgRef.current?.parentElement) {
      setBoxWidth(imgRef.current.parentElement.clientWidth)
    }
  }, [entity.image_url])

  const boxHeight = height || 300

  const handleDragStart = (
    e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>
  ) => {
    e.preventDefault()
    if (!isRepositioning || !imgRef.current) return
    if ("touches" in e) e.preventDefault()
    setIsDragging(true)
    const startX = "touches" in e ? e.touches[0].clientX : e.clientX
    const startY = "touches" in e ? e.touches[0].clientY : e.clientY
    const startTranslateX = currentX
    const startTranslateY = currentY

    const { naturalWidth, naturalHeight } = imgRef.current
    const scaledWidth = boxWidth
    const scaledHeight = (naturalHeight / naturalWidth) * boxWidth
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e) e.preventDefault()
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      const newX = startTranslateX + deltaX
      const newY = startTranslateY + deltaY
      const maxX = (scaledWidth - boxWidth) / 2
      const maxY = (scaledHeight - boxHeight) / 2
      setCurrentX(Math.max(-maxX, Math.min(maxX, newX)))
      setCurrentY(Math.max(-maxY, Math.min(maxY, newY)))
    }
    const handleEnd = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMove as EventListener)
      document.removeEventListener("touchmove", handleMove as EventListener)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchend", handleEnd)
    }
    document.addEventListener("mousemove", handleMove as EventListener)
    document.addEventListener("touchmove", handleMove as EventListener, {
      passive: false,
    })
    document.addEventListener("mouseup", handleEnd)
    document.addEventListener("touchend", handleEnd)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In creation mode, just store position temporarily without API call
      if (creationMode || !entity.id) {
        const position = {
          x_position: currentX,
          y_position: currentY,
          context,
        }

        // Notify parent component about position change
        if (onPositionChange) {
          onPositionChange(position)
        }

        // Update local entity state if setEntity is provided
        if (setEntity) {
          const updatedPositions = entity.image_positions || []
          const existingIndex = updatedPositions.findIndex(
            pos => pos.context === context
          )

          if (existingIndex >= 0) {
            updatedPositions[existingIndex] = position
          } else {
            updatedPositions.push(position)
          }

          setEntity({
            ...entity,
            image_positions: updatedPositions,
          })
        }

        setIsRepositioning(false)
        toastSuccess("Image position updated")
        setIsSaving(false)
        return
      }

      // Normal mode: save to backend
      const response = await client.updateImagePosition(entity, {
        x_position: currentX,
        y_position: currentY,
        context,
      })

      // Update local state with saved position
      setCurrentX(response.data.x_position)
      setCurrentY(response.data.y_position)

      // Update the entity's image_positions array if setEntity is provided
      if (setEntity && response.data) {
        const updatedPositions = entity.image_positions || []
        const existingIndex = updatedPositions.findIndex(
          pos => pos.context === context
        )

        if (existingIndex >= 0) {
          updatedPositions[existingIndex] = response.data
        } else {
          updatedPositions.push(response.data)
        }

        setEntity({
          ...entity,
          image_positions: updatedPositions,
        })
      }

      setIsRepositioning(false)
      toastSuccess("Image position saved successfully")

      // Force a small delay to ensure state updates properly
      setTimeout(() => {
        setCurrentX(response.data.x_position)
        setCurrentY(response.data.y_position)
      }, 100)
    } catch (err: unknown) {
      console.error("Failed to save image position:", err)
      toastError("Failed to save image position")
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateImage = (event: React.MouseEvent) => {
    event.preventDefault()
    setIsGenerateDialogOpen(true)
  }

  const handleGenerateDialogClose = () => {
    setIsGenerateDialogOpen(false)
  }

  const handleGenerateDialogConfirm = () => {
    setIsGenerateDialogOpen(false)
  }

  const handleUploadImage = (event: React.MouseEvent) => {
    event.preventDefault()
    setIsUploadDialogOpen(true)
  }

  const handleUploadDialogClose = () => {
    setIsUploadDialogOpen(false)
  }

  const handleUploadDialogConfirm = () => {
    setIsUploadDialogOpen(false)
  }

  const handleImageClick = () => {
    // Only open viewer if not in repositioning mode
    if (!isRepositioning && entity.image_url) {
      setIsImageViewerOpen(true)
    }
  }

  const handleImageViewerClose = () => {
    setIsImageViewerOpen(false)
  }

  const handleDeleteImage = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    // Don't allow deletion in creation mode (no entity ID to reference)
    if (creationMode || !entity.id) {
      toastError("Cannot delete image before saving the entity")
      return
    }

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await client.deleteEntityImage(entity)

      // Update local entity state with the response (which has image_url cleared)
      if (setEntity && response.data) {
        setEntity({
          ...entity,
          ...response.data,
          image_url: "",
        })
      }

      toastSuccess("Image deleted successfully")
    } catch (err: unknown) {
      console.error("Failed to delete image:", err)
      toastError("Failed to delete image")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Box
      sx={{
        border: entity.image_url ? "none" : "1px dashed",
        width: "100%",
        height: `${boxHeight}px`,
        overflow: "hidden",
        position: "relative",
        mb: 2,
        mx: "auto",
        "&:hover .action-button": {
          opacity: 1,
        },
      }}
    >
      <ImageBox
        entity={entity}
        imgRef={imgRef}
        handleDragStart={handleDragStart}
        isRepositioning={isRepositioning}
        currentX={currentX}
        currentY={currentY}
        isDragging={isDragging}
        onClick={handleImageClick}
      />
      {isRepositioning && entity.image_url && (
        <SaveCancelMiniButtons
          onSave={handleSave}
          onCancel={() => setIsRepositioning(false)}
          isSaving={isSaving}
        />
      )}
      {!isRepositioning && entity.image_url && (
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            display: "flex",
            flexDirection: "row",
            gap: 1,
          }}
        >
          <UploadButton onClick={handleUploadImage} />
          <GenerateButton onClick={handleGenerateImage} />
          {!creationMode && (
            <>
              <RepositionButton onClick={() => setIsRepositioning(true)} />
              <DeleteButton onClick={handleDeleteImage} />
            </>
          )}
        </Box>
      )}
      {!isRepositioning && !entity.image_url && (
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            display: "flex",
            flexDirection: "row",
            gap: 1,
          }}
        >
          <UploadButton onClick={handleUploadImage} />
          <GenerateButton onClick={handleGenerateImage} />
        </Box>
      )}
      <GenerateImageDialog
        open={isGenerateDialogOpen}
        onClose={handleGenerateDialogClose}
        onConfirm={handleGenerateDialogConfirm}
        title="Generate Image"
        entity={entity}
        setEntity={setEntity}
      />
      <UploadImageDialog
        open={isUploadDialogOpen}
        onClose={handleUploadDialogClose}
        onConfirm={handleUploadDialogConfirm}
        title="Upload Image"
        entity={entity}
        setEntity={setEntity}
        creationMode={creationMode}
      />
      {entity.image_url && (
        <ImageViewerModal
          open={isImageViewerOpen}
          onClose={handleImageViewerClose}
          imageUrl={entity.image_url}
          altText={entity.name}
          entity={entity}
        />
      )}
    </Box>
  )
}
