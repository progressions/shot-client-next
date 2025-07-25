"use client"

import { useState, useEffect } from "react"
import { Box, Typography } from "@mui/material"
import { useCampaign } from "@/contexts"
import { FightName } from "@/components/fights"
import { RichTextRenderer } from "@/components/editor"
import type { Fight } from "@/types/types"
import type { SystemStyleObject, Theme } from "@mui/system"

interface FightPageClientProps {
  fight: Fight
}

export default function FightPageClient({ fight }: FightPageClientProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(fight.name)

  // Update document title and displayName on WebSocket updates
  useEffect(() => {
    if (!campaignData) return

    if (campaignData.fight?.id === fight.id) {
      if (campaignData.fight?.name) {
        setDisplayName(campaignData.fight.name)
        document.title = campaignData.fight.name
      }
    }
  }, [campaignData, fight.id])

  // Set initial title on mount
  useEffect(() => {
    document.title = fight.name || "Chi War"
  }, [fight.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <FightName
        fight={fight}
        sx={{
          fontSize: { xs: "1.25rem", md: "1.5rem" } as SystemStyleObject<Theme>,
          mb: { xs: 1, md: 2 },
        }}
      />
      <RichTextRenderer html={fight.description || ""} />
    </Box>
  )
}
