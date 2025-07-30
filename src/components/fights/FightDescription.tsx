"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Fight } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"

interface FightDescriptionProps {
  fight: Fight
  sx?: SystemStyleObject<Theme>
}

export default function FightDescription({
  fight,
  sx = {},
}: FightDescriptionProps) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(
    fight.description || ""
  )

  useEffect(() => {
    if (campaignData) {
      const updatedFight = campaignData?.fight
      if (updatedFight && updatedFight.id === fight.id && updatedFight.description) {
          setDisplayDescription(updatedFight.description)
        }
    }
  }, [campaignData, fight.id])

  return <RichTextRenderer html={displayDescription || ""} sx={sx} />
}
