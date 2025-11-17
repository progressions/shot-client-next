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
    const unsubscribe = subscribeToEntity("faction", updatedFaction => {
      if (updatedFaction && updatedFaction.id === initialFaction.id) {
        setFaction(updatedFaction)
      }
    })
    return unsubscribe
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
