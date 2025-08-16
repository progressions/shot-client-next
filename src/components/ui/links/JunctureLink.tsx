"use client"
import { EntityLink } from "@/components/ui"

type JunctureLinkProperties = {
  juncture: Juncture
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function JunctureLink({
  juncture,
  data,
  disablePopup = false,
  children,
  sx,
}: JunctureLinkProperties) {
  return (
    <EntityLink
      entity={juncture}
      data={data}
      disablePopup={disablePopup}
      sx={sx}
    >
      {children}
    </EntityLink>
  )
}
