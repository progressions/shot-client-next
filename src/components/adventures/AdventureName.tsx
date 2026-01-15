"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Adventure } from "@/types"

interface AdventureNameProperties {
  adventure: Adventure
}

export default function AdventureName({ adventure }: AdventureNameProperties) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(adventure.name)

  useEffect(() => {
    if (campaignData && "adventure" in campaignData) {
      const updatedAdventure = campaignData.adventure
      if (
        updatedAdventure &&
        updatedAdventure.id === adventure.id &&
        updatedAdventure.name
      ) {
        setDisplayName(updatedAdventure.name)
      }
    }
  }, [campaignData, adventure.id])

  return <>{displayName}</>
}
