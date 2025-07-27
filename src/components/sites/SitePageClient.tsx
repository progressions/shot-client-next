"use client"

import { useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { SiteName, SiteDescription } from "@/components/sites"
import type { Site } from "@/types/types"

interface SitePageClientProps {
  site: Site
}

export default function SitePageClient({ site }: SitePageClientProps) {
  useEffect(() => {
    document.title = site.name || "Chi War"
  }, [site.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        <SiteName site={site} />
      </Typography>
      <SiteDescription site={site} sx={{ mb: { xs: 1, md: 2 } }} />
    </Box>
  )
}
