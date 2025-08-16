"use client"
import { EntityLink } from "@/components/ui"

type SchtickLinkProperties = {
  schtick: Schtick
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function SchtickLink({
  schtick,
  data,
  disablePopup = false,
  children,
  sx,
}: SchtickLinkProperties) {
  return (
    <EntityLink
      entity={schtick}
      data={data}
      disablePopup={disablePopup}
      sx={sx}
    >
      {children}
    </EntityLink>
  )
}
