"use client"

import type { Weapon } from "@/types"
import { WeaponLink } from "@/components/links"
import { Badge } from "@/components/badges"

type WeaponBadgeProperties = {
  weapon: Weapon
  size?: "sm" | "md" | "lg"
}

export default function WeaponBadge({
  weapon,
  size = "md",
}: WeaponBadgeProperties) {
  return (
    <Badge entity={weapon} size={size} title={<WeaponLink weapon={weapon} />}>
      {" "}
    </Badge>
  )
}
