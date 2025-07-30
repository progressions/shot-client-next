"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Faction } from "@/types"

interface FactionNameProperties {
  faction: Faction
}

export default function FactionName({ faction }: FactionNameProperties) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(faction.name)

  useEffect(() => {
    if (campaignData && "faction" in campaignData) {
      const updatedFaction = campaignData.faction
      if (
        updatedFaction &&
        updatedFaction.id === faction.id &&
        updatedFaction.name
      ) {
        setDisplayName(updatedFaction.name)
      }
    }
  }, [campaignData, faction.id])

  return <>{displayName}</>
}
