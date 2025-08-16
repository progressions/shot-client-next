"use client"

import { Stack, Box } from "@mui/material"
import type { Weapon } from "@/types"
import { WeaponLink } from "@/components/ui"
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
    <Badge
      name="weapon"
      entity={weapon}
      size={size}
      title={<WeaponLink weapon={weapon} />}
    >
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Box component="span">
          ({weapon.damage}/{weapon.concealment || "-"}/
          {weapon.reload_value || "-"})
        </Box>
        <Box component="span">{weapon.juncture}</Box>
        <Box component="span">{weapon.category}</Box>
      </Stack>
    </Badge>
  )
}
