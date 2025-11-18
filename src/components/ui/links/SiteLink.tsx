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
    // Subscribe to individual site updates
    const unsubscribeSite = subscribeToEntity("site", updatedSite => {
      // Only update if this is the same site
      if (updatedSite && updatedSite.id === initialSite.id) {
        console.log("🔄 [SiteLink] Received site update:", updatedSite)
        setSite(updatedSite)
      }
    })

    // Subscribe to sites reload signal
    const unsubscribeSites = subscribeToEntity("sites", reloadSignal => {
      if (reloadSignal === "reload") {
        console.log("🔄 [SiteLink] Received sites reload signal, keeping current data for now")
      }
    })

    return () => {
      unsubscribeSite()
      unsubscribeSites()
    }
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
