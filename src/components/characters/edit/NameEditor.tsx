"use client"

import type { Character } from "@/types"
import { useState, useEffect } from "react"
import { FormControl, FormHelperText } from "@mui/material"
import { TextField } from "@/components/ui"

type NameEditorProps = {
  character: Character
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
}

export default function NameEditor({
  character,
  setCharacter,
  updateCharacter,
}: NameEditorProps) {
  const [name, setName] = useState<string>(character.name || "")
  const [nameError, setNameError] = useState<string>("")
  const [serverError, setServerError] = useState<string>("")

  useEffect(() => {
    setName(character.name || "")
  }, [character.name])

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "Character name is required"
    }
    return ""
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value
    setName(newName)
    setNameError("") // Clear client-side error while typing
    setServerError("") // Clear server-side error while typing
  }

  const handleNameBlur = async () => {
    const error = validateName(name)
    setNameError(error)
    if (!error) {
      const updatedCharacter = { ...character, name }
      setCharacter(updatedCharacter)
      try {
        await updateCharacter(updatedCharacter)
      } catch (error) {
        setServerError(error.message)
      }
    }
  }

  return (
    <FormControl fullWidth error={!!nameError || !!serverError} sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label="Character Name"
        value={name}
        onChange={handleNameChange}
        onBlur={handleNameBlur}
        error={!!nameError || !!serverError}
        InputProps={{
          sx: { fontSize: "2rem", fontWeight: "bold", color: "#ffffff" },
        }}
      />
      {(nameError || serverError) && (
        <FormHelperText sx={{ mt: -0.5 }}>
          {nameError || serverError}
        </FormHelperText>
      )}
    </FormControl>
  )
}
