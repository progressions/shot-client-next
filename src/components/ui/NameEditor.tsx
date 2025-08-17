"use client"

import type { Entity } from "@/types"
import { useState, useEffect } from "react"
import { FormControl, FormHelperText } from "@mui/material"
import { TextField } from "@/components/ui"

type NameEditorProps = {
  entity: Entity
  setEntity: (entity: Entity) => void
  updateEntity: (updatedEntity: Entity) => Promise<void>
  onValidationChange?: (isValid: boolean) => void
}

export function NameEditor({
  entity,
  setEntity,
  updateEntity = async () => {},
  onValidationChange,
}: NameEditorProps) {
  const [name, setName] = useState<string>(entity.name || "")
  const [nameError, setNameError] = useState<string>("")
  const [serverError, setServerError] = useState<string>("")

  useEffect(() => {
    setName(entity.name || "")
  }, [entity.name])

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "Entity name is required"
    }
    return ""
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value
    setName(newName)
    setNameError("") // Clear client-side error while typing
    setServerError("") // Clear server-side error while typing

    // Call validation callback if provided
    if (onValidationChange) {
      const isValid = validateName(newName) === ""
      onValidationChange(isValid)
    }
  }

  const handleNameBlur = async () => {
    const error = validateName(name)
    setNameError(error)
    if (!error) {
      const updatedEntity = { ...entity, name }
      setEntity(updatedEntity)
      try {
        await updateEntity(updatedEntity)
      } catch (error) {
        setServerError(error.message)
      }
    }
  }

  return (
    <FormControl fullWidth error={!!nameError || !!serverError} sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label="Name"
        name="name"
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
