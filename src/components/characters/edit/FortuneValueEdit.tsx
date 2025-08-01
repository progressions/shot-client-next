"use client"
import type { Character } from "@/types"
import { useState, useEffect } from "react"
import { Box, Stack, Typography, FormControl, FormHelperText, Select, MenuItem } from "@mui/material"
import { TextField } from "@/components/ui"
import { FortuneValueEditLink } from "@/components/links"

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
  const [selectedName, setSelectedName] = useState<string>(name)

  const fortuneOptions = ["Fortune", "Chi", "Magic", "Genome"]

  useEffect(() => {
    setInputValue(value?.toString() || "")
    setSelectedName(name)
  }, [value, name])

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

  const validateName = (val: string): string => {
    if (!val.trim()) {
      return "Attack type is required"
    }
    if (!fortuneOptions.includes(val)) {
      return "Invalid attack type"
    }
    return ""
  }

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setInputValue(newValue)
    setValueError("") // Clear client-side error while typing
    setServerError("") // Clear server-side error while typing
  }

  const handleNameChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newName = event.target.value as string
    setSelectedName(newName)
    setServerError("") // Clear server-side error
    const nameError = validateName(newName)
    if (!nameError) {
      const updatedCharacter = {
        ...character,
        action_values: {
          ...character.action_values,
          [newName]: inputValue || null,
          [name]: undefined // Clear old name if changed
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

  const handleValueBlur = async () => {
    const error = validateValue(inputValue)
    setValueError(error)
    if (!error) {
      const updatedCharacter = {
        ...character,
        action_values: {
          ...character.action_values,
          [selectedName]: parseInt(inputValue, 10) || null
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
    <Stack direction="column" sx={{ alignItems: "flex-start", gap: 0.5 }}>
      <FormControl error={!!valueError || !!serverError} sx={{ width: "120px" }}>
        <Select
          value={selectedName}
          onChange={handleNameChange}
          sx={{
            width: "120px",
            color: "#ffffff",
            fontSize: "1rem",
            lineHeight: "1.5rem",
            height: "2rem",
            "& .MuiSelect-select": {
              padding: "0 24px 0 8px",
              textAlign: "left"
            }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                "& .MuiMenuItem-root": {
                  color: "#ffffff",
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                  textAlign: "left",
                  width: "120px"
                }
              }
            }
          }}
        >
          {fortuneOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <TextField
          name={name}
          value={inputValue}
          onChange={handleValueChange}
          onBlur={handleValueBlur}
          error={!!valueError || !!serverError}
          type="text"
          InputProps={{
            sx: {
              width: "120px",
              fontSize: fontSizeMap[size],
              border: "1px solid #ffffff",
              borderRadius: 1,
              px: 1,
              "& input": {
                textAlign: "center",
                WebkitAppearance: "none",
                MozAppearance: "textfield"
              }
            }
          }}
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
