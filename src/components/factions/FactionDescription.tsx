"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Faction } from "@/types/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"

interface FactionDescriptionProps {
  faction: Faction
  sx?: SystemStyleObject<Theme>
}

export default function FactionDescription({ faction, sx = {} }: FactionDescriptionProps) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(faction.description || "")

  useEffect(() => {
    if (campaignData) {
      const updatedFaction = campaignData?.faction
      if (updatedFaction && updatedFaction.id === faction.id) {
        if (updatedFaction.description) {
          setDisplayDescription(updatedFaction.description)
        }
      }
    }
  }, [campaignData, faction.id])

  return (
    <RichTextRenderer html={displayDescription} sx={sx} />
  )
}
