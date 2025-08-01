"use client"

import type { Character } from "@/types"
import { useState, useEffect } from "react"
import {
  Box,
  Stack,
  Typography,
  FormControl,
  FormHelperText,
} from "@mui/material"
import { TextField } from "@/components/ui"
import { ActionValueLink } from "@/components/links"

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
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "")
  const [valueError, setValueError] = useState<string>("")
  const [serverError, setServerError] = useState<string>("")

  useEffect(() => {
    setInputValue(value?.toString() || "")
  }, [value])

  const minWidthMap = {
    small: { xs: "4rem", sm: "5rem" },
    large: { xs: "5rem", sm: "6rem" },
  }

  const fontSizeMap = {
    small: { xs: "1.5rem", sm: "2rem" },
    large: { xs: "2rem", sm: "3rem" },
  }

  const validateValue = (val: string): string => {
    if (!val.trim()) {
      return `${name} is required`
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
          [name]: parseInt(inputValue, 10) || null, // Convert to number or null
        },
        parties: undefined,
        schticks: undefined,
        sites: undefined,
      }
      setCharacter(updatedCharacter)
      try {
        await updateCharacter(updatedCharacter)
      } catch (error) {
        setServerError(error.message)
      }
    }
  }

  return (
    <Stack direction="column">
      <Typography variant="body2" sx={{ color: "#ffffff" }}>
        <ActionValueLink name={name} />
      </Typography>
      <FormControl error={!!valueError || !!serverError}>
        <TextField
          name={name}
          value={inputValue}
          onChange={handleValueChange}
          onBlur={handleValueBlur}
          error={!!valueError || !!serverError}
          type="text"
          InputProps={{
            sx: {
              width: "110px",
              fontSize: fontSizeMap[size],
              border: "1px solid #ffffff",
              borderRadius: 1,
              px: 1,
              "& input": {
                textAlign: "center",
                WebkitAppearance: "none",
                MozAppearance: "textfield",
              },
            },
          }}
        />
        {(valueError || serverError) && (
          <FormHelperText sx={{ mt: -0.5 }}>
            {valueError || serverError}
          </FormHelperText>
        )}
      </FormControl>
    </Stack>
  )
}
