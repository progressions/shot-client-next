"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const CharacterPopup = dynamic(
  () => import("@/components/popups/CharacterPopup"),
  {
    ssr: false,
  }
)

type CharacterLinkProperties = {
  character: Character
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
  noUnderline?: boolean
}

export default function CharacterLink({
  character,
  data,
  disablePopup = false,
  children,
  sx,
  noUnderline = false,
}: CharacterLinkProperties) {
  return (
    <EntityLink
      entity={character}
      data={data}
      disablePopup={disablePopup}
      popupOverride={CharacterPopup}
      sx={sx}
      noUnderline={noUnderline}
    >
      {children || character.name}
    </EntityLink>
  )
}
