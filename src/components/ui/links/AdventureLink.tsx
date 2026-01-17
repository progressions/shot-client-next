"use client"
import EntityLink from "./EntityLink"
import type { Adventure } from "@/types"

type AdventureLinkProperties = {
  adventure: Adventure
  data?: string | object
  disablePopup?: boolean
  children?: React.ReactNode
  sx?: React.CSSProperties
}

export default function AdventureLink({
  adventure,
  data,
  disablePopup = false,
  children,
  sx,
}: AdventureLinkProperties) {
  return (
    <EntityLink
      entity={adventure}
      data={data}
      disablePopup={disablePopup}
      sx={sx}
    >
      {children || adventure.name}
    </EntityLink>
  )
}
