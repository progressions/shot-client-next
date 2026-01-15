"use client"

import type { Adventure } from "@/types"
import AdventureLink from "../ui/links/AdventureLink"
import Badge from "./Badge"

type AdventureBadgeProperties = {
  adventure: Adventure
  size?: "sm" | "md" | "lg"
}

export default function AdventureBadge({
  adventure,
  size = "md",
}: AdventureBadgeProperties) {
  return (
    <Badge
      name="adventure"
      entity={adventure}
      size={size}
      title={<AdventureLink adventure={adventure} />}
    >
      {adventure.season ? `Season ${adventure.season}` : "Adventure"}
    </Badge>
  )
}
