"use client"

import { useState } from "react"
import { Box, Stack, IconButton } from "@mui/material"
import { TextField } from "@/components/ui"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { SystemStyleObject, Theme } from "@mui/system"

type NumberFieldProps = {
  name: string
  value: number | null
  size: "small" | "large"
  width: string
  error: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  sx?: SystemStyleObject<Theme>
}

export function NumberField({
  name,
  value,
  size = "large",
  width = "140px",
  error,
  onChange,
  onBlur,
  sx = {},
}: NumberFieldProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const fontSizeMap = {
    small: { xs: "1.5rem", sm: "2rem" },
    large: { xs: "2rem", sm: "3rem" },
  }

  const handleIncrement = () => {
    const currentValue = Number(value) || 0
    const newValue = currentValue + 1
    console.log(
      "Increment: currentValue =",
      currentValue,
      "newValue =",
      newValue
    )
    onChange({
      target: { name, value: newValue.toString() },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  const handleDecrement = () => {
    const currentValue = Number(value) || 0
    const newValue = currentValue - 1
    console.log(
      "Decrement: currentValue =",
      currentValue,
      "newValue =",
      newValue
    )
    onChange({
      target: { name, value: newValue.toString() },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <Box
      sx={{ position: "relative", width }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TextField
        name={name}
        value={value?.toString() ?? ""}
        onChange={onChange}
        onBlur={event => {
          setIsFocused(false)
          onBlur(event)
        }}
        onFocus={() => setIsFocused(true)}
        error={error}
        type="text"
        InputProps={{
          sx: {
            width,
            fontSize: fontSizeMap[size],
            borderRadius: 1,
            fontWeight: 600,
            px: 1,
            "& input": {
              textAlign: "center",
              paddingRight: "10px",
            },
            ...sx,
          },
        }}
      />
      <Stack
        direction="column"
        sx={{
          position: "absolute",
          top: "0",
          bottom: "0",
          right: "0",
          gap: 0,
          justifyContent: "space-between",
          display: isFocused || isHovered ? "flex" : "none",
        }}
      >
        <IconButton
          onClick={handleIncrement}
          sx={{
            padding: "0",
            color: "#000000",
            backgroundColor: "#ffffff",
            borderRadius: "2px",
            height: "50%",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
        >
          <AddIcon sx={{ fontSize: "0.75rem" }} />
        </IconButton>
        <IconButton
          onClick={handleDecrement}
          sx={{
            padding: "0",
            color: "#000000",
            backgroundColor: "#ffffff",
            borderRadius: "2px",
            height: "50%",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
        >
          <RemoveIcon sx={{ fontSize: "0.75rem" }} />
        </IconButton>
      </Stack>
    </Box>
  )
}
