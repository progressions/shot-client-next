"use client"
import { EntityLink } from "@/components/ui"

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
      sx={sx}
    >
      {children}
    </EntityLink>
  )
}
