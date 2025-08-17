"use client"

import { useState, useEffect } from "react"
import { TextField } from "@/components/ui"
import { CS } from "@/services"
import type { Character } from "@/types"

type DescriptionValueProps = {
  name: string
  type?: "text" | "number"
  value: string
  character: Character
  updateCharacter: (character: Character) => Promise<void>
}

export default function DescriptionValue({
  name,
  type = "text",
  value: propValue,
  character,
  updateCharacter,
}: DescriptionValueProps) {
  const [value, setValue] = useState(propValue || "")

  // Sync local state when prop value changes
  useEffect(() => {
    setValue(propValue || "")
  }, [propValue])

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }

  const handleSave = async () => {
    const updatedCharacter = CS.changeDescriptionValue(character, name, value)
    await updateCharacter(updatedCharacter)
  }

  return (
    <TextField
      label={name}
      name={name}
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={handleSave}
      fullWidth
      variant="outlined"
      margin="normal"
    />
  )
}
