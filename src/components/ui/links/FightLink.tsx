"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const FightPopup = dynamic(() => import("@/components/popups/FightPopup"), {
  ssr: false,
})

type FightLinkProperties = {
  fight: Fight
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function FightLink({
  fight: initialFight,
  data,
  disablePopup = false,
  children,
  sx,
}: FightLinkProperties) {
  const { subscribeToEntity } = useApp()
  const [fight, setFight] = useState(initialFight)

  // Subscribe to fight updates via WebSocket
  useEffect(() => {
    // Subscribe to individual fight updates
    const unsubscribeFight = subscribeToEntity("fight", updatedFight => {
      // Only update if this is the same fight
      if (updatedFight && updatedFight.id === initialFight.id) {
        console.log("🔄 [FightLink] Received fight update:", updatedFight)
        setFight(updatedFight)
      }
    })

    // Subscribe to fights reload signal
    const unsubscribeFights = subscribeToEntity("fights", reloadSignal => {
      // For reload signals, we need to refetch the fight data
      if (reloadSignal === "reload") {
        console.log("🔄 [FightLink] Received fights reload signal, keeping current data for now")
        // Note: We could refetch here, but for now we'll rely on the individual fight updates
      }
    })

    return () => {
      unsubscribeFight()
      unsubscribeFights()
    }
  }, [subscribeToEntity, initialFight.id])

  // Update when prop changes
  useEffect(() => {
    setFight(initialFight)
  }, [initialFight])

  return (
    <EntityLink
      entity={fight}
      data={data}
      disablePopup={disablePopup}
      popupOverride={FightPopup}
      sx={sx}
    >
      {children || fight.name}
    </EntityLink>
  )
}
