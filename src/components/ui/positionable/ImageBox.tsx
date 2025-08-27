"use client"

import { Box } from "@mui/material"
import type { Entity } from "@/types"

type ImageBoxProps = {
  entity: Entity
  imgRef: React.RefObject<HTMLImageElement>
  handleDragStart: (
    e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>
  ) => void
  isRepositioning: boolean
  currentX?: number
  currentY?: number
  isDragging?: boolean
  onClick?: () => void
}

export function ImageBox({
  entity,
  imgRef,
  handleDragStart,
  isRepositioning,
  currentX,
  currentY,
  isDragging,
  onClick,
}: ImageBoxProps) {
  if (!entity.image_url) return

  const handleClick = (event: React.MouseEvent) => {
    // Only trigger click for viewing if not repositioning and not dragging
    if (!isRepositioning && !isDragging && onClick) {
      event.stopPropagation()
      onClick()
    }
    // If repositioning, don't trigger the viewer
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLImageElement>) => {
    if (isRepositioning) {
      event.preventDefault() // Prevent default drag
      handleDragStart(event)
    }
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLImageElement>) => {
    if (isRepositioning) {
      event.preventDefault() // Prevent default drag
      handleDragStart(event)
    }
  }

  return (
    <Box
      ref={imgRef}
      component="img"
      src={entity.image_url}
      alt={entity.name}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDragStart={e => e.preventDefault()} // Prevent browser's default drag
      draggable={false} // Disable HTML5 drag
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
          : onClick && !isRepositioning
            ? "pointer"
            : "default",
        userSelect: "none",
        touchAction: isRepositioning ? "none" : "auto",
        WebkitUserDrag: "none", // Prevent drag on Safari/Chrome
        userDrag: "none", // Additional drag prevention
      }}
    />
  )
}
