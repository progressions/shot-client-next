"use client"
import type { Character } from "@/types"
import { useState, useEffect } from "react"
import {
  Stack,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
} from "@mui/material"
import { NumberField } from "@/components/ui"
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
  value,
  size = "large",
  character,
  setCharacter,
  updateCharacter,
}: AttackValueEditProps) {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "")
  const [valueError, setValueError] = useState<string>("")
  const [serverError, setServerError] = useState<string>("")
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
    setInputValue(value?.toString() || "")
    setSelectedName(name)
  }, [value, name])

  const validateValue = (val: number): string => {
    if (!val) {
      return `${name} is required`
    }
    if (isNaN(Number(val))) {
      return `${name} must be a number`
    }
    return ""
  }

  const validateName = (val: string): string => {
    if (!val.trim()) {
      return "Attack type is required"
    }
    if (!attackOptions.includes(val)) {
      return "Invalid attack type"
    }
    return ""
  }

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value.toString(), 10)
    setInputValue(newValue)
    setValueError("") // Clear client-side error while typing
    setServerError("") // Clear server-side error while typing
  }

  const handleAttackNameChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const newName = event.target.value as string
    setSelectedName(newName)
    setServerError("") // Clear server-side error
  }

  const handleValueBlur = async () => {
    const error = validateValue(inputValue)
    setValueError(error)
    if (!error) {
      const updatedCharacter = CS.changeAttackValue(
        character,
        selectedName,
        parseInt(inputValue, 10)
      )
      console.log("updatedCharacter", updatedCharacter)
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
