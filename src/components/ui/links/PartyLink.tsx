"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const PartyPopup = dynamic(() => import("@/components/popups/PartyPopup"), {
  ssr: false,
})

type PartyLinkProperties = {
  party: Party
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function PartyLink({
  party: initialParty,
  data,
  disablePopup = false,
  children,
  sx,
}: PartyLinkProperties) {
  const { subscribeToEntity } = useApp()
  const [party, setParty] = useState(initialParty)

  // Subscribe to party updates via WebSocket
  useEffect(() => {
    // Subscribe to individual party updates
    const unsubscribeParty = subscribeToEntity("party", updatedParty => {
      if (updatedParty && updatedParty.id === initialParty.id) {
        console.log("🔄 [PartyLink] Received party update:", updatedParty)
        setParty(updatedParty)
      }
    })

    // Subscribe to parties reload signal
    const unsubscribeParties = subscribeToEntity("parties", reloadSignal => {
      if (reloadSignal === "reload") {
        console.log(
          "🔄 [PartyLink] Received parties reload signal, keeping current data for now"
        )
      }
    })

    return () => {
      unsubscribeParty()
      unsubscribeParties()
    }
  }, [subscribeToEntity, initialParty.id])

  // Update when prop changes
  useEffect(() => {
    setParty(initialParty)
  }, [initialParty])

  return (
    <EntityLink
      entity={party}
      data={data}
      disablePopup={disablePopup}
      popupOverride={PartyPopup}
      sx={sx}
    >
      {children || party.name}
    </EntityLink>
  )
}
