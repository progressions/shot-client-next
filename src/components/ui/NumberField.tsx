"use client"
import { useState } from "react"
import { Box, Stack, IconButton } from "@mui/material"
import { TextField } from "@/components/ui"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"

type NumberFieldProps = {
  name: string
  value: string
  size: "small" | "large"
  error: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
}

export function NumberField({
  name,
  value,
  size,
  error,
  onChange,
  onBlur,
}: NumberFieldProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const fontSizeMap = {
    small: { xs: "1.5rem", sm: "2rem" },
    large: { xs: "2rem", sm: "3rem" },
  }

  const handleIncrement = () => {
    const currentValue = parseInt(value, 10) || 0
    const newValue = (currentValue + 1).toString()
    onChange({
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  const handleDecrement = () => {
    const currentValue = parseInt(value, 10) || 0
    const newValue = (currentValue - 1).toString()
    onChange({
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <Box
      sx={{ position: "relative", width: "140px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TextField
        name={name}
        value={value}
        onChange={onChange}
        onBlur={(event) => {
          setIsFocused(false)
          onBlur(event)
        }}
        onFocus={() => setIsFocused(true)}
        error={error}
        type="text"
        InputProps={{
          sx: {
            width: "140px",
            fontSize: fontSizeMap[size],
            border: "1px solid #ffffff",
            borderRadius: 1,
            px: 1,
            "& input": {
              textAlign: "center",
              paddingRight: "10px" // Reserve space for buttons
            }
          }
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
          display: isFocused || isHovered ? "flex" : "none"
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
            "&:hover": { backgroundColor: "#e0e0e0" }
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
            "&:hover": { backgroundColor: "#e0e0e0" }
          }}
        >
          <RemoveIcon sx={{ fontSize: "0.75rem" }} />
        </IconButton>
      </Stack>
    </Box>
  )
}
