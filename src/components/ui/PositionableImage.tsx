"use client"

import type { Entity } from "@/types"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import { useState, useEffect, useRef } from "react"
import { RepositionButton, SaveButton, CancelButton } from "@/components/ui"
import { useClient } from "@/contexts"

type PositionableImageProps = {
  entity: Entity
  pageContext: "index" | "entity"
  height?: number
}

export function PositionableImage({
  entity,
  pageContext = "entity",
  height,
}: PositionableImageProps) {
  const { client } = useClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const imgRef = useRef<HTMLImageElement>(null)
  const [boxWidth, setBoxWidth] = useState(0)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const context = `${isMobile ? "mobile" : "desktop"}_${pageContext}`
  const position = entity.image_positions?.find(
    pos => pos.context === context
  ) || { x_position: 0, y_position: 0 }
  const [currentX, setCurrentX] = useState(position.x_position)
  const [currentY, setCurrentY] = useState(position.y_position)
  const [isDragging, setIsDragging] = useState(false)

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

  if (!entity.image_url) return null

  const boxHeight = height || 300

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isRepositioning || !imgRef.current) return
    e.preventDefault()
    setIsDragging(true)
    const startX = e.clientX
    const startY = e.clientY
    const startTranslateX = currentX
    const startTranslateY = currentY
    const { naturalWidth, naturalHeight } = imgRef.current
    const scaledWidth = boxWidth
    const scaledHeight = (naturalHeight / naturalWidth) * boxWidth

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      const newX = startTranslateX + deltaX
      const newY = startTranslateY + deltaY
      const maxX = (scaledWidth - boxWidth) / 2
      const maxY = (scaledHeight - boxHeight) / 2
      setCurrentX(Math.max(-maxX, Math.min(maxX, newX)))
      setCurrentY(Math.max(-maxY, Math.min(maxY, newY)))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleSave = async () => {
    if (!entity.id) return
    try {
      await client.updateImagePosition(entity, {
        x_position: currentX,
        y_position: currentY,
        context,
      })
      setIsRepositioning(false)
    } catch (error) {
      console.error("Failed to save image position:", error)
    }
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
        "&:hover .reposition-button": {
          opacity: 1,
        },
      }}
    >
      <Box
        ref={imgRef}
        component="img"
        src={entity.image_url}
        alt={entity.name}
        onMouseDown={handleMouseDown}
        sx={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          display: "block",
          transform: `translate(${currentX}px, ${currentY}px)`,
          cursor: isRepositioning ? (isDragging ? "move" : "grab") : "default",
          userSelect: "none",
        }}
      />
      {isRepositioning ? (
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            display: "flex",
            gap: 1,
          }}
        >
          <SaveButton size="mini" onClick={handleSave} />
          <CancelButton
            variant="contained"
            size="mini"
            onClick={() => setIsRepositioning(false)}
          />
        </Box>
      ) : (
        <RepositionButton
          className="reposition-button"
          variant="contained"
          size="mini"
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          onClick={() => setIsRepositioning(true)}
        />
      )}
    </Box>
  )
}
