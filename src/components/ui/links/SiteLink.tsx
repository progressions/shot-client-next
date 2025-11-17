"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts"
import type { Site } from "@/types"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const SitePopup = dynamic(() => import("@/components/popups/SitePopup"), {
  ssr: false,
})

type SiteLinkProperties = {
  site: Site
  data?: string | object
  disablePopup?: boolean
  children?: React.ReactNode
  sx?: React.CSSProperties
}

export default function SiteLink({
  site: initialSite,
  data,
  disablePopup = false,
  children,
  sx,
}: SiteLinkProperties) {
  const { subscribeToEntity } = useApp()
  const [site, setSite] = useState(initialSite)

  // Subscribe to site updates via WebSocket
  useEffect(() => {
    const unsubscribe = subscribeToEntity("site", updatedSite => {
      // Only update if this is the same site
      if (updatedSite && updatedSite.id === initialSite.id) {
        console.log(`🔄 SiteLink: Updating site ${initialSite.id} with new data:`, updatedSite)
        setSite(updatedSite)
      }
    })

    return unsubscribe
  }, [subscribeToEntity, initialSite.id])

  // Update when prop changes
  useEffect(() => {
    setSite(initialSite)
  }, [initialSite])

  return (
    <EntityLink
      entity={site}
      data={data}
      disablePopup={disablePopup}
      popupOverride={SitePopup}
      sx={sx}
    >
      {children || site.name}
    </EntityLink>
  )
}
