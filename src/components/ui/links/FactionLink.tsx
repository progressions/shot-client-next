"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const FactionPopup = dynamic(() => import("@/components/popups/FactionPopup"), {
  ssr: false,
})

type FactionLinkProperties = {
  faction: Faction
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function FactionLink({
  faction: initialFaction,
  data,
  disablePopup = false,
  children,
  sx,
}: FactionLinkProperties) {
  const { subscribeToEntity } = useApp()
  const [faction, setFaction] = useState(initialFaction)

  // Subscribe to faction updates via WebSocket
  useEffect(() => {
    // Subscribe to individual faction updates
    const unsubscribeFaction = subscribeToEntity("faction", updatedFaction => {
      if (updatedFaction && updatedFaction.id === initialFaction.id) {
        console.log("🔄 [FactionLink] Received faction update:", updatedFaction)
        setFaction(updatedFaction)
      }
    })

    // Subscribe to factions reload signal
    const unsubscribeFactions = subscribeToEntity("factions", reloadSignal => {
      if (reloadSignal === "reload") {
        console.log("🔄 [FactionLink] Received factions reload signal, keeping current data for now")
      }
    })

    return () => {
      unsubscribeFaction()
      unsubscribeFactions()
    }
  }, [subscribeToEntity, initialFaction.id])

  // Update when prop changes
  useEffect(() => {
    setFaction(initialFaction)
  }, [initialFaction])

  return (
    <EntityLink
      entity={faction}
      data={data}
      disablePopup={disablePopup}
      popupOverride={FactionPopup}
      sx={sx}
    >
      {children || faction.name}
    </EntityLink>
  )
}
