"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Character } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"
import { CS } from "@/services"

interface CharacterDescriptionProperties {
  character: Character
  sx?: SystemStyleObject<Theme>
}

export default function CharacterDescription({
  character,
  sx = {},
}: CharacterDescriptionProperties) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(
    CS.description(character) || ""
  )

  useEffect(() => {
    if (campaignData) {
      const updatedCharacter = campaignData?.character
      if (
        updatedCharacter &&
        updatedCharacter.id === character.id &&
        CS.description(updatedCharacter)
      ) {
        setDisplayDescription(CS.description(updatedCharacter))
      }
    }
  }, [campaignData, character.id])

  if (!CS.description(character)) return
  return <RichTextRenderer html={displayDescription || ""} sx={sx} />
}
