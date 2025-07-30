"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Site } from "@/types"

interface SiteNameProps {
  site: Site
}

export default function SiteName({ site }: SiteNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(site.name)

  useEffect(() => {
    if (campaignData && "site" in campaignData) {
      const updatedSite = campaignData.site
      if (updatedSite && updatedSite.id === site.id && updatedSite.name) {
          setDisplayName(updatedSite.name)
        }
    }
  }, [campaignData, site.id])

  return <>{displayName}</>
}
