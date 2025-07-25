"use client"

import { useState, useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { useCampaign } from "@/contexts"
import type { Fight, CampaignCableData } from "@/types/types"
import type { SystemStyleObject, Theme } from "@mui/system"
import { RichTextRenderer } from "@/components/editor"
import Link from "next/link"

interface FightNameProps {
  fight: Fight
  sx?: SystemStyleObject<Theme>
}

export default function FightName({ fight, sx = {} }: FightNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(fight.name)
  const [displayDescription, setDisplayDescription] = useState(fight.description || "")

  useEffect(() => {
    if (campaignData && "fight" in campaignData) {
      const updatedFight = campaignData.fight
      if (updatedFight && updatedFight.id === fight.id) {
        if (updatedFight.name) {
          setDisplayName(updatedFight.name)
        }
      }
    }
  }, [campaignData])

  return (
    <Typography variant="h6" sx={{ color: "#ffffff", ...sx }}>
      {displayName}
    </Typography>
  )
}
