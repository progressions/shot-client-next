"use client"

import { useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { SchtickName, SchtickDescription } from "@/components/schticks"
import type { Schtick } from "@/types/types"

interface SchtickPageClientProps {
  schtick: Schtick
}

export default function SchtickPageClient({ schtick }: SchtickPageClientProps) {
  useEffect(() => {
    document.title = schtick.name || "Chi War"
  }, [schtick.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        <SchtickName schtick={schtick} />
      </Typography>
      <SchtickDescription schtick={schtick} sx={{ mb: { xs: 1, md: 2 } }} />
    </Box>
  )
}
