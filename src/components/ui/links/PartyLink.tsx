"use client"
import { EntityLink } from "@/components/ui"

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
    <EntityLink entity={party} data={data} disablePopup={disablePopup} sx={sx}>
      {children}
    </EntityLink>
  )
}
