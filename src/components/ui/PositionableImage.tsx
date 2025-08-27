"use client"

import type { Entity } from "@/types"
import { Box } from "@mui/material"
import { useState, useEffect, useRef } from "react"
import {
  UploadButton,
  ImageBox,
  GenerateButton,
  RepositionButton,
  SaveCancelMiniButtons,
} from "@/components/ui"
import { GenerateImageDialog, UploadImageDialog } from "@/components/generate"
import { useToast, useClient } from "@/contexts"

type PositionableImageProps = {
  entity: Entity
  setEntity?: (entity: Entity) => void
  pageContext: "index" | "entity" | "edit"
  height?: number
  isMobile?: boolean
}

export function PositionableImage({
  entity,
  setEntity,
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
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const { toastSuccess, toastError } = useToast()
  const context = `${isMobile ? "mobile" : "desktop"}_${pageContext}`
  const position = entity.image_positions?.find(
    pos => pos.context === context
  ) || { x_position: 0, y_position: 0 }
  
  console.log("🏁 COMPONENT RENDER:", {
    entityId: entity.id,
    context,
    position,
    allPositions: entity.image_positions
  })
  
  const [currentX, setCurrentX] = useState(position.x_position)
  const [currentY, setCurrentY] = useState(position.y_position)
  
  // Sync position state with entity data (but only when not actively repositioning)
  useEffect(() => {
    if (!isRepositioning && !isDragging) {
      setCurrentX(position.x_position)
      setCurrentY(position.y_position)
    }
  }, [position.x_position, position.y_position, isRepositioning, isDragging])
  
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const updateBoxWidth = () => {
      if (imgRef.current?.parentElement) {
        const width = imgRef.current.parentElement.clientWidth
        console.log("📐 UPDATE BOX WIDTH:", {
          hasParent: !!imgRef.current?.parentElement,
          parentWidth: width,
          currentBoxWidth: boxWidth,
          imgElement: !!imgRef.current,
          imageUrl: entity.image_url
        })
        setBoxWidth(width)
      } else {
        console.log("📐 NO PARENT ELEMENT:", {
          hasImgRef: !!imgRef.current,
          hasParent: !!imgRef.current?.parentElement,
          imageUrl: entity.image_url
        })
      }
    }
    updateBoxWidth()
    window.addEventListener("resize", updateBoxWidth)
    return () => window.removeEventListener("resize", updateBoxWidth)
  }, [])

  // Re-calculate box width when image URL changes
  useEffect(() => {
    if (entity.image_url && imgRef.current?.parentElement) {
      const width = imgRef.current.parentElement.clientWidth
      console.log("📐 IMAGE URL CHANGED - UPDATE BOX WIDTH:", {
        imageUrl: entity.image_url,
        parentWidth: width,
        currentBoxWidth: boxWidth
      })
      setBoxWidth(width)
    }
  }, [entity.image_url])


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
    
    console.log("🎯 DRAG START:", {
      currentX,
      currentY,
      startTranslateX,
      startTranslateY,
      startX,
      startY,
      entityPositions: entity.image_positions,
      context
    })
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
      const finalX = Math.max(-maxX, Math.min(maxX, newX))
      const finalY = Math.max(-maxY, Math.min(maxY, newY))
      
      console.log("🔄 DRAG MOVE:", {
        deltaX, deltaY, newX, newY, maxX, maxY, finalX, finalY,
        scaledWidth, boxWidth, scaledHeight, boxHeight
      })
      
      setCurrentX(finalX)
      setCurrentY(finalY)
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
          <RepositionButton onClick={() => setIsRepositioning(true)} />
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
      />
      <UploadImageDialog
        open={isUploadDialogOpen}
        onClose={handleUploadDialogClose}
        onConfirm={handleUploadDialogConfirm}
        title="Upload Image"
        entity={entity}
        setEntity={setEntity}
      />
    </Box>
  )
}
