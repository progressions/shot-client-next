"use client"

import { useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { JunctureName, JunctureDescription } from "@/components/junctures"
import type { Juncture } from "@/types/types"

interface JuncturePageClientProps {
  juncture: Juncture
}

export default function JuncturePageClient({ juncture }: JuncturePageClientProps) {
  useEffect(() => {
    document.title = juncture.name || "Chi War"
  }, [juncture.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        <JunctureName juncture={juncture} />
      </Typography>
      <JunctureDescription juncture={juncture} sx={{ mb: { xs: 1, md: 2 } }} />
    </Box>
  )
}
