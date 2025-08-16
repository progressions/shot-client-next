"use client"
import { EntityLink } from "@/components/ui"

type CharacterLinkProperties = {
  character: Character
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function CharacterLink({
  character,
  data,
  disablePopup = false,
  children,
  sx,
}: CharacterLinkProperties) {
  return (
    <EntityLink
      entity={character}
      data={data}
      disablePopup={disablePopup}
      sx={sx}
    >
      {children}
    </EntityLink>
  )
}
