"use client"

import type { Schtick } from "@/types"
import SchtickLink from "../ui/links/SchtickLink"
import Badge from "./Badge"

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
