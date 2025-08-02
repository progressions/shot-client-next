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

type FortuneValueEditProps = {
  name: string
  value: number | string | null
  size: "small" | "large"
  character: Character
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
}

export default function FortuneValueEdit({
  name,
  value,
  size = "large",
  character,
  setCharacter,
  updateCharacter,
}: FortuneValueEditProps) {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "")
  const [valueError, setValueError] = useState<string>("")
  const [serverError, setServerError] = useState<string>("")
  const [selectedName, setSelectedName] = useState<string>(name || "")

  const fortuneOptions = ["Fortune", "Chi", "Magic", "Genome"]

  useEffect(() => {
    setInputValue(value?.toString() || "")
    setSelectedName(name)
  }, [value, name])

  const validateValue = (val: string): string => {
    if (!val.trim()) {
      return `${name} is required`
    }
    if (isNaN(Number(val))) {
      return `${name} must be a number`
    }
    return ""
  }

  const validateName = (val: string): string => {
    if (!val.trim()) {
      return "Fortune type is required"
    }
    if (!fortuneOptions.includes(val)) {
      return "Invalid fortune type"
    }
    return ""
  }

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setInputValue(newValue)
    setValueError("") // Clear client-side error while typing
    setServerError("") // Clear server-side error while typing
  }

  const handleFortuneNameChange = (
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
      const updatedCharacter = CS.changeFortuneValue(
        character,
        selectedName,
        inputValue
      )
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

  const handleFortuneNameBlur = async () => {
    const nameError = validateName(selectedName)
    setServerError(nameError)
    if (!nameError) {
      const updatedCharacter = CS.changeFortuneType(character, selectedName)
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
          onChange={handleFortuneNameChange}
          onBlur={handleFortuneNameBlur}
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
          {fortuneOptions.map(option => (
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
