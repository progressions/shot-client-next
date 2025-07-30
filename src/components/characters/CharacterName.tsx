"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Character } from "@/types"

interface CharacterNameProperties {
  character: Character
}

export default function CharacterName({ character }: CharacterNameProperties) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(character.name)

  useEffect(() => {
    if (campaignData && "character" in campaignData) {
      const updatedCharacter = campaignData.character
      if (
        updatedCharacter &&
        updatedCharacter.id === character.id &&
        updatedCharacter.name
      ) {
        setDisplayName(updatedCharacter.name)
      }
    }
  }, [campaignData, character.id])

  return <>{displayName}</>
}
