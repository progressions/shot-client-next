"use client"
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
  faction,
  data,
  disablePopup = false,
  children,
  sx,
}: FactionLinkProperties) {
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
