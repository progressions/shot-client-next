"use client"
import { useState, useEffect } from "react"
import { useAppContext } from "@/contexts"
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
  character: initialCharacter,
  data,
  disablePopup = false,
  children,
  sx,
  noUnderline = false,
}: CharacterLinkProperties) {
  const { subscribeToEntity } = useAppContext()
  const [character, setCharacter] = useState(initialCharacter)

  // Subscribe to character updates via WebSocket
  useEffect(() => {
    const unsubscribe = subscribeToEntity("character", updatedCharacter => {
      // Only update if this is the same character
      if (updatedCharacter.id === initialCharacter.id) {
        setCharacter(updatedCharacter)
      }
    })

    return unsubscribe
  }, [subscribeToEntity, initialCharacter.id])

  // Update when prop changes
  useEffect(() => {
    setCharacter(initialCharacter)
  }, [initialCharacter])

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
