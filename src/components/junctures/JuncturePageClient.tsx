"use client"

import { useState, useEffect } from "react"
import { Typography, Box } from "@mui/material"
import type { Juncture } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"

interface JuncturePageClientProps {
  juncture: Juncture
}

export default function JuncturePageClient({
  juncture: initialJuncture,
}: JuncturePageClientProps) {
  const { campaignData } = useCampaign()
  const [juncture, setJuncture] = useState<Juncture>(initialJuncture)

  useEffect(() => {
    document.title = juncture.name ? `${juncture.name} - Chi War` : "Chi War"
  }, [juncture.name])

  useEffect(() => {
    if (
      campaignData?.juncture &&
      campaignData.juncture.id === initialJuncture.id
    ) {
      setJuncture(campaignData.juncture)
    }
  }, [campaignData, initialJuncture])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="h4" sx={{ mb: 1 }}>
        {juncture.name}
      </Typography>
      {juncture.image_url && (
        <Box
          component="img"
          src={juncture.image_url}
          alt={juncture.name}
          sx={{
            width: "100%",
            maxWidth: "400px",
            mb: 2,
            display: "block",
            mx: "auto",
          }}
        />
      )}
      <RichTextRenderer
        key={juncture.description}
        html={juncture.description || ""}
        sx={{ mb: 2 }}
      />
    </Box>
  )
}
