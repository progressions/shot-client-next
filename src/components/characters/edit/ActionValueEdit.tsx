"use client"

import type { Character } from "@/types"
import { useState, useEffect } from "react"
import { Stack, Typography, FormControl, FormHelperText } from "@mui/material"
import { NumberField } from "@/components/ui"
import { ActionValueLink } from "@/components/links"
import { useToast } from "@/contexts"

type ActionValueProps = {
  name: string
  value: number | string | null
  size: "small" | "large"
  character: Character
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
}

export default function ActionValue({
  name,
  value,
  size = "large",
  character,
  setCharacter,
  updateCharacter,
}: ActionValueProps) {
  const { toastSuccess, toastError } = useToast()
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "")
  const [valueError, setValueError] = useState<string>("")
  const [serverError, setServerError] = useState<string>("")

  useEffect(() => {
    setInputValue(value?.toString() || "")
  }, [value])

  const validateValue = (val: string): string => {
    if (!val.trim()) {
      return `${name} is required`
    }
    if (isNaN(Number(val))) {
      return `${name} must be a number`
    }
    return ""
  }

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setInputValue(newValue)
    setValueError("") // Clear client-side error while typing
    setServerError("") // Clear server-side error while typing
  }

  const handleValueBlur = async () => {
    const error = validateValue(inputValue)
    setValueError(error)
    if (!error) {
      const updatedCharacter = {
        ...character,
        action_values: {
          ...character.action_values,
          [name]: parseInt(inputValue, 10) || null
        },
        parties: undefined,
        schticks: undefined,
        sites: undefined,
      }
      setCharacter(updatedCharacter)
      try {
        await updateCharacter(updatedCharacter)
        toastSuccess("Character updated successfully")
      } catch (error) {
        setServerError(error.message)
        toastError(`Error updating character: ${error.message}`)
      }
    }
  }

  return (
    <Stack direction="column" sx={{ alignItems: "flex-start", gap: 0.5, width: 130 }}>
      <FormControl error={!!valueError || !!serverError} sx={{ width: "110px" }}>
        <Typography
          variant="body2"
          sx={{
            width: "110px",
            color: "#ffffff",
            fontSize: "1rem",
            textAlign: "left",
            height: "2rem",
            mt: 1,
            lineHeight: "1.5rem"
          }}
        >
          <ActionValueLink name={name} />
        </Typography>
        <NumberField
          name={name}
          value={inputValue}
          size={size}
          error={!!valueError || !!serverError}
          onChange={handleValueChange}
          onBlur={handleValueBlur}
        />
        {(valueError || serverError) && (
          <FormHelperText sx={{ mt: -0.5, textAlign: "left" }}>
            {valueError || serverError}
          </FormHelperText>
        )}
      </FormControl>
    </Stack>
  )
}
