"use client"
import type { Character } from "@/types"
import { useState, useEffect } from "react"
import { Box, Stack, Typography, FormControl, FormHelperText } from "@mui/material"
import { TextField } from "@/components/ui"
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

  const handleValueChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setInputValue(newValue)
    setValueError("") // Clear client-side error while typing
    setServerError("") // Clear server-side error while typing
    const error = validateValue(newValue)
    setValueError(error)
    if (!error) {
      const updatedCharacter = {
        ...character,
        action_values: {
          ...character.action_values,
          [name]: parseInt(newValue, 10) || null
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
    <Stack direction="column" sx={{ alignItems: "flex-start", gap: 0.5 }}>
      <FormControl error={!!valueError || !!serverError} sx={{ width: "110px" }}>
        <Typography
          variant="body2"
          sx={{
            width: "110px",
            color: "#ffffff",
            fontSize: "1rem",
            textAlign: "left",
            height: "2rem",
            lineHeight: "1.5rem"
          }}
        >
          <ActionValueLink name={name} />
        </Typography>
        <TextField
          name={name}
          value={inputValue}
          onChange={handleValueChange}
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
