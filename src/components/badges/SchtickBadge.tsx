"use client"

import type { Schtick } from "@/types"
import { SchtickLink } from "@/components/links"
import { Badge } from "@/components/badges"

type SchtickBadgeProps = {
  schtick: Schtick
  size?: "sm" | "md" | "lg"
}

export default function SchtickBadge({
  schtick,
  size = "md",
}: SchtickBadgeProps) {
  return (
    <Badge
      entity={schtick}
      size={size}
      title={<SchtickLink schtick={schtick} />}
    >
      {" "}
    </Badge>
  )
}
