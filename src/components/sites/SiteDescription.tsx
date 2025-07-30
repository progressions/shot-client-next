"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Site } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"

interface SiteDescriptionProperties {
  site: Site
  sx?: SystemStyleObject<Theme>
}

export default function SiteDescription({
  site,
  sx = {},
}: SiteDescriptionProperties) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(
    site.description || ""
  )

  useEffect(() => {
    if (campaignData) {
      const updatedSite = campaignData?.site
      if (
        updatedSite &&
        updatedSite.id === site.id &&
        updatedSite.description
      ) {
        setDisplayDescription(updatedSite.description)
      }
    }
  }, [campaignData, site.id])

  return <RichTextRenderer html={displayDescription} sx={sx} />
}
