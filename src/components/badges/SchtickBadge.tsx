"use client"

import type { Schtick } from "@/types"
import { SchtickLink } from "@/components/links"
import { Badge } from "@/components/badges"

type SchtickBadgeProperties = {
  schtick: Schtick
  size?: "sm" | "md" | "lg"
}

export default function SchtickBadge({
  schtick,
  size = "md",
}: SchtickBadgeProperties) {
  return (
    <Badge
      name="schtick"
      entity={schtick}
      size={size}
      title={<SchtickLink schtick={schtick} />}
    >
      {" "}
    </Badge>
  )
}
