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
    const unsubscribe = subscribeToEntity("party", updatedParty => {
      if (updatedParty && updatedParty.id === initialParty.id) {
        setParty(updatedParty)
      }
    })
    return unsubscribe
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
