"use client"

import { useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { WeaponName, WeaponDescription } from "@/components/weapons"
import type { Weapon } from "@/types/types"

interface WeaponPageClientProps {
  weapon: Weapon
}

export default function WeaponPageClient({ weapon }: WeaponPageClientProps) {
  useEffect(() => {
    document.title = weapon.name || "Chi War"
  }, [weapon.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        <WeaponName weapon={weapon} />
      </Typography>
      <WeaponDescription weapon={weapon} sx={{ mb: { xs: 1, md: 2 } }} />
    </Box>
  )
}
