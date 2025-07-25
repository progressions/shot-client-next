"use client"

import { useState, useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { useCampaign } from "@/contexts"
import type { Fight } from "@/types/types"
import { RichTextRenderer } from "@/components/editor"
import Link from "next/link"

interface FightDescriptionProps {
  fight: Fight
  sx?: React.CSSProperties
}

export default function FightDescription({ fight, sx = {} }: FightDescriptionProps) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(fight.description || "") // Assuming Fight type has description; add to types if needed

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
    <RichTextRenderer html={displayDescription} />
  )
}
