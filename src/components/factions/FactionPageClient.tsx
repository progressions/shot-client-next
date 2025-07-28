"use client"

import { useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { FactionName, FactionDescription } from "@/components/factions"
import type { Faction } from "@/types/types"

interface FactionPageClientProps {
  faction: Faction
}

export default function FactionPageClient({ faction }: FactionPageClientProps) {
  useEffect(() => {
    document.title = faction.name || "Chi War"
  }, [faction.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        <FactionName faction={faction} />
      </Typography>
      <FactionDescription faction={faction} sx={{ mb: { xs: 1, md: 2 } }} />
    </Box>
  )
}
