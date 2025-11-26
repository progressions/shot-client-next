"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts"
import { usePathname } from "next/navigation"
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
  const { subscribeToEntity } = useApp()
  const pathname = usePathname()
  const [character, setCharacter] = useState(initialCharacter)

  // Subscribe to character updates via WebSocket with fallback polling
  useEffect(() => {
    let lastUpdateTime = Date.now()

    // Subscribe to individual character updates
    const unsubscribeCharacter = subscribeToEntity(
      "character",
      updatedCharacter => {
        // Only update if this is the same character
        if (updatedCharacter && updatedCharacter.id === initialCharacter.id) {
          console.log(
            "🔄 [CharacterLink] Received character update:",
            updatedCharacter
          )
          lastUpdateTime = Date.now()
          setCharacter(updatedCharacter)
        }
      }
    )

    return () => {
      unsubscribeCharacter()
    }
  }, [subscribeToEntity, initialCharacter.id, pathname])

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
