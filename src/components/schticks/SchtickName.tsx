"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Schtick } from "@/types"

interface SchtickNameProps {
  schtick: Schtick
}

export default function SchtickName({ schtick }: SchtickNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(schtick.name)

  useEffect(() => {
    if (campaignData && "schtick" in campaignData) {
      const updatedSchtick = campaignData.schtick
      if (updatedSchtick && updatedSchtick.id === schtick.id && updatedSchtick.name) {
          setDisplayName(updatedSchtick.name)
        }
    }
  }, [campaignData, schtick.id])

  return <>{displayName}</>
}
