"use client"

import type { Entity } from "@/types"
import { PositionableImage } from "@/components/ui"

type HeroImageProps = {
  entity: Entity
  pageContext: "index" | "entity"
}

export function HeroImage({ entity, pageContext = "entity" }: HeroImageProps) {
  return (
    <PositionableImage entity={entity} pageContext={pageContext} height={300} />
  )
}
