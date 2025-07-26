"use client"

import { useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { FightName, FightDescription } from "@/components/fights"
import type { Fight } from "@/types/types"

interface FightPageClientProps {
  fight: Fight
}

export default function FightPageClient({ fight }: FightPageClientProps) {
  useEffect(() => {
    document.title = fight.name || "Chi War"
  }, [fight.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        <FightName fight={fight} />
      </Typography>
      <FightDescription fight={fight} sx={{ mb: { xs: 1, md: 2 } }} />
    </Box>
  )
}
