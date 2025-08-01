"use client"

import type { Entity } from "@/types"
import { Box, useMediaQuery, useTheme, Button } from "@mui/material"
import { useState, useEffect, useRef } from "react"
import { SaveButton, CancelButton } from "@/components/ui"

type HeroImageProps = {
  entity: Entity
  pageContext: "index" | "entity"
}

export function HeroImage({ entity, pageContext }: HeroImageProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const imgRef = useRef<HTMLImageElement>(null)
  const [boxWidth, setBoxWidth] = useState(0)
  const [isRepositioning, setIsRepositioning] = useState(false)

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

  const position = entity.image_positions?.find((pos) =>
    pos.context === (isMobile ? `mobile_${pageContext}` : `desktop_${pageContext}`)
  ) || { x_position: 0, y_position: 0 }

  const imageWidth = 900
  const imageHeight = 600
  const boxHeight = 300

  const maxX = (imageWidth - boxWidth) / 2
  const maxY = (imageHeight - boxHeight) / 2
  const clampedX = Math.max(-maxX, Math.min(maxX, position.x_position))
  const clampedY = Math.max(-maxY, Math.min(maxY, position.y_position))

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
          opacity: 1
        }
      }}
    >
      <Box
        ref={imgRef}
        component="img"
        src={`${entity.image_url}?tr=w-900,h-600,fo-face,z-0.1`}
        alt={entity.name}
        sx={{
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          objectFit: "cover",
          display: "block",
          transform: `translate(${clampedX}px, ${clampedY}px)`
        }}
      />
      {isRepositioning ? (
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            display: "flex",
            gap: 1
          }}
        >
          <SaveButton />
          <CancelButton variant="contained" onClick={() => setIsRepositioning(false)} />
        </Box>
      ) : (
        <Button
          className="reposition-button"
          variant="contained"
          size="small"
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            opacity: 0,
            transition: "opacity 0.2s"
          }}
          onClick={() => setIsRepositioning(true)}
        >
          Reposition
        </Button>
      )}
    </Box>
  )
}
