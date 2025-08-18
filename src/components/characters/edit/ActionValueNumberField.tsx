"use client"

import type { Character } from "@/types"
import { useState, useEffect } from "react"
import { FormControl, FormHelperText } from "@mui/material"
import { NumberField } from "@/components/ui"
import { useToast } from "@/contexts"
import { CS } from "@/services"
import { SystemStyleObject, Theme } from "@mui/system"

type ActionValueProps = {
  name: string
  size: "small" | "large"
  width?: string
  character: Character
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
  sx?: SystemStyleObject<Theme>
}

export default function ActionValue({
  name,
  size = "large",
  character,
  setCharacter,
  updateCharacter,
  width = "140px",
  sx = {},
}: ActionValueProps) {
  const { toastSuccess, toastError } = useToast()
  const [value, setValue] = useState<string>(
    character.action_values[name]?.toString() || ""
  )
  const [valueError, setValueError] = useState<string>("")
  const [serverError, setServerError] = useState<string>("")

  useEffect(() => {
    if (character.action_values[name] !== undefined) {
      setValue(character.action_values[name].toString())
    } else {
      setValue("")
    }
  }, [character.action_values, name])

  useEffect(() => {
    if (value?.toString() !== value) {
      setValue(value?.toString() || "")
    }
  }, [value])

  const validateValue = (val: string): string => {
    const trimmedVal = val.trim()
    if (!trimmedVal) {
      return `${name} is required`
    }
    const num = Number(trimmedVal)
    if (isNaN(num)) {
      return `${name} must be a number`
    }
    if (!Number.isInteger(num)) {
      return `${name} must be an integer`
    }
    if (num < 0) {
      return `${name} cannot be negative`
    }
    return ""
  }

  const handleValueChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value
    setValue(newValue)
    setValueError("")
    setServerError("")
    await handleValueBlur({
      target: { value: newValue },
    } as React.FocusEvent<HTMLInputElement>)
  }

  const handleValueBlur = async event => {
    const error = validateValue(event.target.value)
    setValue(event.target.value)
    setValueError(error)
    if (!error) {
      const numericValue = Number(event.target.value.trim())
      const updatedCharacter = CS.updateActionValue(
        character,
        name,
        numericValue
      )
      setCharacter(updatedCharacter)
      try {
        await updateCharacter(updatedCharacter)
        toastSuccess("Character updated successfully")
      } catch (error: unknown) {
        setServerError(error.message)
        toastError(`Error updating character: ${error.message}`)
      }
    }
  }

  return (
    <FormControl error={!!valueError || !!serverError}>
      <NumberField
        name={name}
        value={value ? Number(value) : null}
        size={size}
        error={!!valueError || !!serverError}
        onChange={handleValueChange}
        onBlur={handleValueBlur}
        width={width}
        sx={sx}
      />
      {(valueError || serverError) && (
        <FormHelperText sx={{ mt: -0.5, textAlign: "left" }}>
          {valueError || serverError}
        </FormHelperText>
      )}
    </FormControl>
  )
}
