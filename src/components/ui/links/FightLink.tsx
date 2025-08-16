"use client"
import { EntityLink } from "@/components/ui"

type FightLinkProperties = {
  fight: Fight
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function FightLink({
  fight,
  data,
  disablePopup = false,
  children,
  sx,
}: FightLinkProperties) {
  return (
    <EntityLink entity={fight} data={data} disablePopup={disablePopup} sx={sx}>
      {children}
    </EntityLink>
  )
}
