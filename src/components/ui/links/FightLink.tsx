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
    const unsubscribe = subscribeToEntity("fight", updatedFight => {
      // Only update if this is the same fight
      if (updatedFight && updatedFight.id === initialFight.id) {
        setFight(updatedFight)
      }
    })

    return unsubscribe
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
