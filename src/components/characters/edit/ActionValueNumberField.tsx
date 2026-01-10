"use client"

import type { Character } from "@/types"
import { useState, useEffect, useRef, useCallback } from "react"
import { FormControl, FormHelperText } from "@mui/material"
import { NumberField } from "@/components/ui"
import { useToast } from "@/contexts"
import { CS } from "@/services"
import { SystemStyleObject, Theme } from "@mui/system"

// Debounce delay in ms - gives user time to finish typing (e.g., "12")
const DEBOUNCE_DELAY = 600

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
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedValueRef = useRef<string>(value)

  useEffect(() => {
    if (character.action_values[name] != null) {
      const newValue = character.action_values[name].toString()
      setValue(newValue)
      lastSavedValueRef.current = newValue
    } else {
      setValue("")
      lastSavedValueRef.current = ""
    }
  }, [character.action_values, name])

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const validateValue = useCallback(
    (val: string): string => {
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
    },
    [name]
  )

  const saveValue = useCallback(
    async (newValue: string) => {
      // Skip if value hasn't changed from last save
      if (newValue === lastSavedValueRef.current) {
        return
      }

      const error = validateValue(newValue)
      setValueError(error)
      if (!error) {
        const numericValue = Number(newValue.trim())
        const updatedCharacter = CS.updateActionValue(
          character,
          name,
          numericValue
        )
        setCharacter(updatedCharacter)
        try {
          await updateCharacter(updatedCharacter)
          lastSavedValueRef.current = newValue
          toastSuccess("Character updated successfully")
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error"
          setServerError(errorMessage)
          toastError(`Error updating character: ${errorMessage}`)
        }
      }
    },
    [
      character,
      name,
      setCharacter,
      updateCharacter,
      toastSuccess,
      toastError,
      validateValue,
    ]
  )

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setValue(newValue)
    setValueError("")
    setServerError("")

    // Clear any existing debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new debounced save - waits for user to stop typing
    debounceRef.current = setTimeout(() => {
      saveValue(newValue)
    }, DEBOUNCE_DELAY)
  }

  const handleValueBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    // Clear debounce and save immediately on blur
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    await saveValue(event.target.value)
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
