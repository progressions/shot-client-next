"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts"
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
  const [character, setCharacter] = useState(initialCharacter)

  // Subscribe to character updates via WebSocket with fallback polling
  useEffect(() => {
    console.log("🔗 [CharacterLink] Setting up WebSocket subscription for character:", initialCharacter.name, initialCharacter.id)

    let lastUpdateTime = Date.now()

    // Subscribe to individual character updates
    const unsubscribeCharacter = subscribeToEntity("character", updatedCharacter => {
      // Only update if this is the same character
      if (updatedCharacter && updatedCharacter.id === initialCharacter.id) {
        console.log("🔄 [CharacterLink] Received character update:", updatedCharacter)
        lastUpdateTime = Date.now()
        setCharacter(updatedCharacter)
      }
    })

    // Subscribe to characters reload signal
    const unsubscribeCharacters = subscribeToEntity("characters", reloadSignal => {
      // For reload signals, we need to refetch the character data
      if (reloadSignal === "reload") {
        console.log("🔄 [CharacterLink] Received characters reload signal, refreshing page in 1 second")
        // As a fallback, refresh the page if WebSocket isn't working properly
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    })

    return () => {
      unsubscribeCharacter()
      unsubscribeCharacters()
    }
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
