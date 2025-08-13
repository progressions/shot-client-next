"use client"

import { Box } from "@mui/material"
import type { Entity } from "@/types"
import { PositionableImage } from "@/components/ui"

type HeroImageProps = {
  entity: Entity
  setEntity: (entity: Entity) => void
  pageContext: "index" | "entity" | "play" | "edit"
  positionable?: boolean
  height?: number
}

export function HeroImage({
  entity,
  setEntity,
  pageContext = "entity",
  positionable = true,
  height = 300,
}: HeroImageProps) {
  if (positionable) {
    return (
      <PositionableImage
        entity={entity}
        setEntity={setEntity}
        pageContext={pageContext}
        height={height}
      />
    )
  }

  if (!positionable && !entity.image_url) {
    return null
  }
  if (!entity.image_url) {
    return (
      <Box
        sx={{
          border: "1px dashed",
          width: "100%",
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      ></Box>
    )
  }
  return (
    <Box
      component="img"
      src={entity.image_url}
      alt={entity.name}
      sx={{
        width: "100%",
        height: `${height}px`,
        objectFit: "cover",
        objectPosition: "50% 20%",
        mb: 2,
        display: "block",
        mx: "auto",
      }}
    />
  )
}
