"use client"

import type { Character } from "@/types"
import { useEffect } from "react"
import { Select, MenuItem } from "@mui/material"
import { CS } from "@/services"

type AttackValueEditProps = {
  attack: string
  name: string
  value: number | string | null
  character: Character
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
  selectedName: string
  setSelectedName: (name: string) => void
}

export default function AttackValueEdit({
  attack = "MainAttack",
  name,
  character,
  setCharacter,
  updateCharacter,
  selectedName,
  setSelectedName,
}: AttackValueEditProps) {
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
  }, [setSelectedName, name])

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
  }

  const handleAttackNameBlur = async () => {
    const nameError = validateName(selectedName)
    if (!nameError) {
      const updatedCharacter = CS.changeAttack(character, attack, selectedName)
      setCharacter(updatedCharacter)
      await updateCharacter({
        ...updatedCharacter,
        sites: undefined,
        schticks: undefined,
        parties: undefined,
      })
    }
  }

  return (
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
  )
}
