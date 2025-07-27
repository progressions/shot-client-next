"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Juncture } from "@/types/types"

interface JunctureNameProps {
  juncture: Juncture
}

export default function JunctureName({ juncture }: JunctureNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(juncture.name)

  useEffect(() => {
    if (campaignData && "juncture" in campaignData) {
      const updatedJuncture = campaignData.juncture
      if (updatedJuncture && updatedJuncture.id === juncture.id) {
        if (updatedJuncture.name) {
          setDisplayName(updatedJuncture.name)
        }
      }
    }
  }, [campaignData, juncture.id])

  return (<>
    {displayName}
  </>)
}
