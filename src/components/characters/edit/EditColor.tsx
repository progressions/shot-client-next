"use client"

import type { Character } from "@/types"
import { ColorPickerField } from "@/components/ui"

type EditColorProps = {
  character: Character
  updateCharacter: (character: Character) => void
}

export default function EditColor({
  character,
  updateCharacter,
}: EditColorProps) {
  const handleColorChange = (value: string | null) => {
    updateCharacter({
      ...character,
      color: value,
    })
  }

  return (
    <ColorPickerField
      label="Ring Color"
      value={character.color}
      onChange={handleColorChange}
    />
  )
}
