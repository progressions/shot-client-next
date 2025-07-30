"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Party } from "@/types"

interface PartyNameProperties {
  party: Party
}

export default function PartyName({ party }: PartyNameProperties) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(party.name)

  useEffect(() => {
    if (campaignData && "party" in campaignData) {
      const updatedParty = campaignData.party
      if (updatedParty && updatedParty.id === party.id && updatedParty.name) {
        setDisplayName(updatedParty.name)
      }
    }
  }, [campaignData, party.id])

  return <>{displayName}</>
}
