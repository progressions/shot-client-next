"use client"

import { Box } from "@mui/material"
import type { Entity } from "@/types"
import { PositionableImage } from "@/components/ui"

type HeroImageProps = {
  entity: Entity
  pageContext: "index" | "entity"
  positionable?: boolean
}

export function HeroImage({
  entity,
  pageContext = "entity",
  positionable = true,
}: HeroImageProps) {
  if (positionable) {
    return (
      <PositionableImage
        entity={entity}
        pageContext={pageContext}
        height={500}
      />
    )
  }

  return (
    <Box
      component="img"
      src={entity.image_url}
      alt={entity.name}
      sx={{
        width: "100%",
        height: "300px",
        objectFit: "cover",
        objectPosition: "50% 20%",
        mb: 2,
        display: "block",
        mx: "auto",
      }}
    />
  )
}
