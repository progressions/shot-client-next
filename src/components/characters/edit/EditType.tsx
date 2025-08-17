"use client"

import type { Character } from "@/types"
import { Autocomplete } from "@/components/ui"
import { useState, useEffect } from "react"
import { CS } from "@/services"

type EditTypeProps = {
  character: Character
  updateCharacter: (character: Character) => void
}

export default function EditType({
  character,
  updateCharacter,
}: EditTypeProps) {
  const [characterType, setCharacterType] = useState(CS.type(character))

  // Sync local state when character prop changes
  useEffect(() => {
    setCharacterType(CS.type(character))
  }, [character])

  const fetchCharacterTypes = async () => {
    const characterTypes = [
      "Ally",
      "PC",
      "Mook",
      "Featured Foe",
      "Boss",
      "Uber-Boss",
    ].map(type => ({
      label: type,
      value: type,
    }))
    return Promise.resolve(characterTypes)
  }

  const handleTypeChange = async (value: string | null) => {
    if (!value) return

    const updatedCharacter = CS.updateActionValue(character, "Type", value)
    setCharacterType(value)
    updateCharacter(updatedCharacter)
  }

  return (
    <Autocomplete
      label="Type"
      value={characterType || ""}
      fetchOptions={fetchCharacterTypes}
      onChange={handleTypeChange}
      allowNone={false}
    />
  )
}
