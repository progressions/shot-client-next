"use client"

import type { Entity } from "@/types"
import { Box } from "@mui/material"
import { useState, useEffect, useRef } from "react"
import { MiniButton, SaveButton, CancelButton } from "@/components/ui"
import { GenerateImageDialog } from "@/components/generate"
import { useToast, useClient } from "@/contexts"

type PositionableImageProps = {
  entity: Entity
  pageContext: "index" | "entity"
  height?: number
  isMobile?: boolean
}

export function PositionableImage({
  entity,
  pageContext = "entity",
  height,
  isMobile = false,
}: PositionableImageProps) {
  const { client } = useClient()
  const imgRef = useRef<HTMLImageElement>(null)
  const [boxWidth, setBoxWidth] = useState(0)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const { toastSuccess, toastError } = useToast()
  const context = `${isMobile ? "mobile" : "desktop"}_${pageContext}`
  const position = entity.image_positions?.find(
    pos => pos.context === context
  ) || { x_position: 0, y_position: 0 }
  const [currentX, setCurrentX] = useState(position.x_position)
  const [currentY, setCurrentY] = useState(position.y_position)
  const [isDragging, setIsDragging] = useState(false)

  if (entity.name == "Highway Brawl") {
    console.log("PositionableImage rendered with entity:", {
      entity,
      currentX,
      currentY,
      context,
      position,
    })
  }

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

  const boxHeight = entity.image_url ? height : 100

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
    if (!entity.id) return
    setIsSaving(true)
    try {
      const response = await client.updateImagePosition(entity, {
        x_position: currentX,
        y_position: currentY,
        context,
      })
      setCurrentX(response.data.x_position)
      setCurrentY(response.data.y_position)
      setIsRepositioning(false)
      toastSuccess("Image position saved successfully")
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
    console.log("Generate image confirmed for entity:", entity.name)
    setIsGenerateDialogOpen(false)
  }

  return (
    <Box
      sx={{
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
      {entity.image_url && (
        <Box
          ref={imgRef}
          component="img"
          src={entity.image_url}
          alt={entity.name}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          sx={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
            display: "block",
            transform: `translate(${currentX}px, ${currentY}px)`,
            cursor: isRepositioning
              ? isDragging
                ? "move"
                : "grab"
              : "default",
            userSelect: "none",
            touchAction: isRepositioning ? "none" : "auto",
          }}
        />
      )}
      {isRepositioning && entity.image_url && (
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            display: "flex",
            gap: 1,
          }}
        >
          <SaveButton size="mini" onClick={handleSave} disabled={isSaving} />
          <CancelButton
            variant="contained"
            size="mini"
            onClick={() => setIsRepositioning(false)}
            disabled={isSaving}
          />
        </Box>
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
          <MiniButton
            className="action-button"
            variant="contained"
            size="mini"
            sx={{
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onClick={handleGenerateImage}
          >
            Generate
          </MiniButton>
          <MiniButton
            className="action-button"
            variant="contained"
            size="mini"
            sx={{
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onClick={() => setIsRepositioning(true)}
          >
            Reposition
          </MiniButton>
        </Box>
      )}
      {!isRepositioning && !entity.image_url && (
        <MiniButton
          className="action-button"
          variant="contained"
          size="mini"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          onClick={handleGenerateImage}
        >
          Generate Image
        </MiniButton>
      )}
      <GenerateImageDialog
        open={isGenerateDialogOpen}
        onClose={handleGenerateDialogClose}
        onConfirm={handleGenerateDialogConfirm}
        title="Generate Image"
        entity={entity}
      />
    </Box>
  )
}
