"use client"
import type { Character } from "@/types"
import { useState } from "react"
import { Stack } from "@mui/material"
import {
  AttackNameSelect,
  ActionValueNumberField,
} from "@/components/characters"

type AttackValueEditProps = {
  attack: string
  name: string
  value: number | string | null
  size: "small" | "large"
  character: Character
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
}

export default function AttackValueEdit({
  attack = "MainAttack",
  name,
  size = "large",
  character,
  setCharacter,
  updateCharacter,
}: AttackValueEditProps) {
  const [selectedName, setSelectedName] = useState<string>(name || "")

  return (
    <Stack
      direction="column"
      sx={{ alignItems: "flex-start", gap: 0.5, width: 130 }}
    >
      <AttackNameSelect
        attack={attack}
        name={name}
        size={size}
        character={character}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
        selectedName={selectedName}
        setSelectedName={setSelectedName}
      />
      <ActionValueNumberField
        name={selectedName}
        size={size}
        character={character}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />
    </Stack>
  )
}
