"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Schtick } from "@/types/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"

interface SchtickDescriptionProps {
  schtick: Schtick
  sx?: SystemStyleObject<Theme>
}

export default function SchtickDescription({ schtick, sx = {} }: SchtickDescriptionProps) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(schtick.description || "")

  useEffect(() => {
    if (campaignData) {
      const updatedSchtick = campaignData?.schtick
      if (updatedSchtick && updatedSchtick.id === schtick.id) {
        if (updatedSchtick.description) {
          setDisplayDescription(updatedSchtick.description)
        }
      }
    }
  }, [campaignData, schtick.id])

  return (
    <RichTextRenderer html={displayDescription} sx={sx} />
  )
}
