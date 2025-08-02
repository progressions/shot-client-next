"use client"
import type { Character } from "@/types"
import { useState, useEffect } from "react"
import { Stack, Select, MenuItem } from "@mui/material"
import { CS } from "@/services"
import { ActionValueNumberField } from "@/components/characters"

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

  const attackOptions = [
    "Guns",
    "Martial Arts",
    "Scroungetech",
    "Sorcery",
    "Genome",
    "Creature",
  ]

  useEffect(() => {
    setSelectedName(name)
  }, [name])

  const validateName = (val: string): string => {
    if (!val.trim()) {
      return "Attack type is required"
    }
    if (!attackOptions.includes(val)) {
      return "Invalid attack type"
    }
    return ""
  }

  const handleAttackNameChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const newName = event.target.value as string
    setSelectedName(newName)
    setServerError("") // Clear server-side error
  }

  const handleAttackNameBlur = async () => {
    const nameError = validateName(selectedName)
    setServerError(nameError)
    if (!nameError) {
      const updatedCharacter = CS.changeAttack(character, attack, selectedName)
      setCharacter(updatedCharacter)
      try {
        await updateCharacter({
          ...updatedCharacter,
          sites: undefined,
          schticks: undefined,
          parties: undefined,
        })
      } catch (error) {
        setServerError(error.message)
      }
    }
  }

  return (
    <Stack direction="column" sx={{ alignItems: "flex-start", gap: 0.5 }}>
      <Select
        value={selectedName}
        onChange={handleAttackNameChange}
        onBlur={handleAttackNameBlur}
        sx={{
          width: "140px",
          color: "#ffffff",
          fontSize: "1rem",
          lineHeight: "1.5rem",
          height: "2rem",
          mb: 1,
          "& .MuiSelect-select": {
            padding: "0 24px 0 8px",
            textAlign: "left",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              "& .MuiMenuItem-root": {
                color: "#ffffff",
                fontSize: "1rem",
                lineHeight: "1.5rem",
                textAlign: "left",
                width: "140px",
              },
            },
          },
        }}
      >
        {attackOptions.map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      <ActionValueNumberField
        name={name}
        size={size}
        character={character}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />
    </Stack>
  )
}
