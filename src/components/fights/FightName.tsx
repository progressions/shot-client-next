"use client"

import { useState, useEffect } from "react"
import { Typography } from "@mui/material"
import { useCampaign } from "@/contexts"
import type { Fight } from "@/types/types"

interface FightNameProps {
  fight: Fight
}

export default function FightName({ fight }: FightNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(fight.name)

  console.log("campaignData", campaignData)

  useEffect(() => {
    if (campaignData) {
      const updatedFight = campaignData?.fight
      if (updatedFight && updatedFight.id === fight.id) {
        setDisplayName(updatedFight.name)
      }
    }
  }, [campaignData])

  return (
    <Typography variant="body1" sx={{ color: "#ffffff", mb: 1 }}>
      {displayName}
    </Typography>
  )
}
