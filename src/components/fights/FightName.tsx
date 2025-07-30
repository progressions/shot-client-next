"use client"

import { useEffect, useState } from "react"
import { useCampaign } from "@/contexts"
import type { Fight } from "@/types"

interface FightNameProperties {
  fight: Fight
}

export default function FightName({ fight }: FightNameProperties) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(fight.name)

  useEffect(() => {
    if (campaignData && "fight" in campaignData) {
      const updatedFight = campaignData.fight
      if (updatedFight && updatedFight.id === fight.id && updatedFight.name) {
        setDisplayName(updatedFight.name)
      }
    }
  }, [campaignData, fight.id])

  return <>{displayName}</>
}
