"use client"

import { useState, useEffect } from "react"
import { Typography } from "@mui/material"
import { useCampaign } from "@/contexts"
import type { Fight } from "@/types/types"
import type { SystemStyleObject, Theme } from "@mui/system"

interface FightNameProps {
  fight: Fight
  sx?: SystemStyleObject<Theme>
}

export default function FightName({ fight, sx = {} }: FightNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(fight.name)

  useEffect(() => {
    if (campaignData && "fight" in campaignData) {
      const updatedFight = campaignData.fight
      if (updatedFight && updatedFight.id === fight.id) {
        if (updatedFight.name) {
          setDisplayName(updatedFight.name)
        }
      }
    }
  }, [campaignData, fight.id])

  return (
    <Typography variant="h6" sx={{ color: "#ffffff", ...sx }}>
      {displayName}
    </Typography>
  )
}
