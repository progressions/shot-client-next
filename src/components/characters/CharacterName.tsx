"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Character } from "@/types/types"

interface CharacterNameProps {
  character: Character
}

export default function CharacterName({ character }: CharacterNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(character.name)

  useEffect(() => {
    if (campaignData && "character" in campaignData) {
      const updatedCharacter = campaignData.character
      if (updatedCharacter && updatedCharacter.id === character.id) {
        if (updatedCharacter.name) {
          setDisplayName(updatedCharacter.name)
        }
      }
    }
  }, [campaignData, character.id])

  return (<>
      {displayName}
    </>)
}
