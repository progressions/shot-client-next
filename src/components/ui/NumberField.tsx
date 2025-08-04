"use client"
import { useState } from "react"
import { Box, Stack, IconButton } from "@mui/material"
import { TextField } from "@/components/ui"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { SystemStyleObject, Theme } from "@mui/system"
import { useTheme } from "@mui/material/styles"

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
  width,
  error,
  onChange,
  onBlur,
  sx = {},
}: NumberFieldProps) {
  const theme = useTheme()
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const fontSizeMap = {
    small: { xs: "1rem", sm: "1.5rem" },
    large: { xs: "2rem", sm: "3rem" },
  }
  const paddingMap = {
    small: { xs: "0.5rem", sm: "1rem" },
    large: { xs: "1.5rem", sm: "2rem" },
  }
  const widthMap = {
    small: { xs: "60px", sm: "80px" },
    large: { xs: "100px", sm: "140px" },
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
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        "&:hover": { border: `1px solid ${theme.palette.primary.main}` },
        borderRadius: 1,
        position: "relative",
        width: width || widthMap[size],
        overflow: "hidden",
      }}
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
            width: width || widthMap[size],
            fontSize: fontSizeMap[size],
            borderRadius: 1,
            fontWeight: 600,
            px: 1,
            "& input": {
              textAlign: "center",
              paddingRight: `${paddingMap[size]}`,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none", // Remove default border
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none", // Remove hover border
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none", // Remove focused border
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
          right: isFocused || isHovered ? "0" : "-30px",
          gap: 0,
          justifyContent: "space-between",
          transition: "right 0.3s ease-in-out",
          opacity: isFocused || isHovered ? 1 : 0,
          pointerEvents: isFocused || isHovered ? "auto" : "none",
        }}
      >
        <IconButton
          onClick={handleIncrement}
          sx={{
            padding: "0",
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
            borderRadius: "0px 6px 0px 0px",
            height: "50%",
            "&:hover": { backgroundColor: theme.palette.action.hover },
          }}
        >
          <AddIcon sx={{ fontSize: "0.75rem" }} />
        </IconButton>
        <IconButton
          onClick={handleDecrement}
          sx={{
            padding: "0",
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
            borderRadius: "0px 0px 6px 0px",
            height: "50%",
            "&:hover": { backgroundColor: theme.palette.action.hover },
          }}
        >
          <RemoveIcon sx={{ fontSize: "0.75rem" }} />
        </IconButton>
      </Stack>
    </Box>
  )
}
