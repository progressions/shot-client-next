"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Party } from "@/types/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"

interface PartyDescriptionProps {
  party: Party
  sx?: SystemStyleObject<Theme>
}

export default function PartyDescription({ party, sx = {} }: PartyDescriptionProps) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(party.description || "")

  useEffect(() => {
    if (campaignData) {
      const updatedParty = campaignData?.party
      if (updatedParty && updatedParty.id === party.id) {
        if (updatedParty.description) {
          setDisplayDescription(updatedParty.description)
        }
      }
    }
  }, [campaignData, party.id])

  return (
    <RichTextRenderer html={displayDescription} sx={sx} />
  )
}
