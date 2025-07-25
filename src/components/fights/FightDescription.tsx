"use client"

import { useState, useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { useCampaign } from "@/contexts"
import type { Fight } from "@/types/types"
import { RichTextRenderer } from "@/components/editor"

interface FightDescriptionProps {
  fight: Fight
  sx?: React.CSSProperties
}

export default function FightDescription({ fight, sx = {} }: FightDescriptionProps) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(fight.description || "")

  useEffect(() => {
    if (campaignData) {
      const updatedFight = campaignData?.fight
      if (updatedFight && updatedFight.id === fight.id) {
        if (updatedFight.description) {
          setDisplayDescription(updatedFight.description)
        }
      }
    }
  }, [campaignData])

  return (
    <RichTextRenderer html={displayDescription} sx={sx} />
  )
}
