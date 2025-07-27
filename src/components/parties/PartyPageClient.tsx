"use client"

import { useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { PartyName, PartyDescription } from "@/components/parties"
import type { Party } from "@/types/types"

interface PartyPageClientProps {
  party: Party
}

export default function PartyPageClient({ party }: PartyPageClientProps) {
  useEffect(() => {
    document.title = party.name || "Chi War"
  }, [party.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        <PartyName party={party} />
      </Typography>
      <PartyDescription party={party} sx={{ mb: { xs: 1, md: 2 } }} />
    </Box>
  )
}
