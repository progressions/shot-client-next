"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Juncture } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"

interface JunctureDescriptionProperties {
  juncture: Juncture
  sx?: SystemStyleObject<Theme>
}

export default function JunctureDescription({
  juncture,
  sx = {},
}: JunctureDescriptionProperties) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(
    juncture.description || ""
  )

  useEffect(() => {
    if (campaignData) {
      const updatedJuncture = campaignData?.juncture
      if (
        updatedJuncture &&
        updatedJuncture.id === juncture.id &&
        updatedJuncture.description
      ) {
        setDisplayDescription(updatedJuncture.description)
      }
    }
  }, [campaignData, juncture.id])

  return <RichTextRenderer html={displayDescription} sx={sx} />
}
