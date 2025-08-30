"use client"
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
  party,
  data,
  disablePopup = false,
  children,
  sx,
}: PartyLinkProperties) {
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
