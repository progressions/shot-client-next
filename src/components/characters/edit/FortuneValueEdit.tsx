"use client"

import type { Character } from "@/types"
import { useState, useEffect } from "react"
import { Stack, Select, MenuItem, FormHelperText } from "@mui/material"
import { CS } from "@/services"
import { ActionValueNumberField } from "@/components/characters"

type FortuneValueEditProps = {
  name: string
  size: "small" | "large"
  character: Character
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
}

export default function FortuneValueEdit({
  name,
  size = "large",
  character,
  setCharacter,
  updateCharacter,
}: FortuneValueEditProps) {
  const [selectedName, setSelectedName] = useState<string>(name || "")
  const [serverError, setServerError] = useState<string>("")

  const fortuneOptions = ["Fortune", "Chi", "Magic", "Genome"]

  useEffect(() => {
    setSelectedName(name)
  }, [name])

  const validateName = (val: string): string => {
    if (!val.trim()) {
      return "Fortune type is required"
    }
    if (!fortuneOptions.includes(val)) {
      return "Invalid fortune type"
    }
    return ""
  }

  const handleFortuneNameChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const newName = event.target.value as string
    setSelectedName(newName)
    setServerError("") // Clear server-side error
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
      {serverError && (
        <FormHelperText error sx={{ mt: 0, mb: 1 }}>
          {serverError}
        </FormHelperText>
      )}
      <ActionValueNumberField
        name="Max Fortune"
        size={size}
        character={character}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />
    </Stack>
  )
}
