"use client"

import { Box } from "@mui/material"
import type { Entity } from "@/types"

type ImageBoxProps = {
  entity: Entity
  imgRef: React.RefObject<HTMLImageElement>
  handleDragStart: () => void
  isRepositioning: boolean
  currentX?: number
  currentY?: number
  isDragging?: boolean
}

export function ImageBox({
  entity,
  imgRef,
  handleDragStart,
  isRepositioning,
  currentX,
  currentY,
  isDragging,
}: ImageBoxProps) {
  if (!entity.image_url) return

  return (
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
        cursor: isRepositioning ? (isDragging ? "move" : "grab") : "default",
        userSelect: "none",
        touchAction: isRepositioning ? "none" : "auto",
      }}
    />
  )
}
