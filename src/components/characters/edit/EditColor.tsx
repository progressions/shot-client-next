"use client"

import type { Character } from "@/types"
import { ColorPickerField } from "@/components/ui"
import { useState, useEffect } from "react"

type EditColorProps = {
  character: Character
  updateCharacter: (character: Character) => void
}

export default function EditColor({
  character,
  updateCharacter,
}: EditColorProps) {
  const [color, setColor] = useState(character.color || null)

  useEffect(() => {
    setColor(character.color || null)
  }, [character.color])

  const handleColorChange = async (value: string | null) => {
    const updatedCharacter = {
      ...character,
      color: value,
    }
    setColor(value)
    updateCharacter(updatedCharacter)
  }

  return (
    <ColorPickerField
      label="Ring Color"
      value={color}
      onChange={handleColorChange}
    />
  )
}
