import type { Entity } from "@/types"
import { Box } from "@mui/material"

type HeroImageProps = {
  entity: Entity
}

export function HeroImage({ entity }: HeroImageProps) {
  if (!entity.image_url) return null

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
