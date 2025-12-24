"use client"

import { useState, useRef, useEffect } from "react"
import {
  Box,
  TextField,
  Popover,
  InputAdornment,
  IconButton,
} from "@mui/material"
import { HexColorPicker } from "react-colorful"
import ClearIcon from "@mui/icons-material/Clear"

type ColorPickerFieldProps = {
  label?: string
  value: string | null | undefined
  onChange: (color: string | null) => void
  size?: "small" | "medium"
  disabled?: boolean
}

const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

export function ColorPickerField({
  label = "Color",
  value,
  onChange,
  size = "small",
  disabled = false,
}: ColorPickerFieldProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [inputValue, setInputValue] = useState(value || "")
  const swatchRef = useRef<HTMLDivElement>(null)

  // Sync inputValue with value prop when it changes externally
  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  const handleSwatchClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleSwatchKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!disabled && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault()
      setAnchorEl(event.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handlePickerChange = (newColor: string) => {
    setInputValue(newColor)
    onChange(newColor)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value
    if (newValue && !newValue.startsWith("#")) {
      newValue = "#" + newValue
    }
    setInputValue(newValue)
    if (isValidHexColor(newValue)) {
      onChange(newValue)
    }
  }

  const handleInputBlur = () => {
    if (inputValue && !isValidHexColor(inputValue)) {
      setInputValue(value || "")
    }
  }

  const handleClear = () => {
    setInputValue("")
    onChange(null)
  }

  const open = Boolean(anchorEl)
  const displayColor = value && isValidHexColor(value) ? value : "#888888"

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        ref={swatchRef}
        onClick={handleSwatchClick}
        onKeyDown={handleSwatchKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={
          value
            ? `Open color picker, current color: ${value}`
            : "Open color picker"
        }
        aria-disabled={disabled}
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          backgroundColor: value ? displayColor : "transparent",
          border: theme =>
            value
              ? `2px solid ${theme.palette.divider}`
              : `2px dashed ${theme.palette.divider}`,
          cursor: disabled ? "default" : "pointer",
          flexShrink: 0,
          "&:hover": {
            borderColor: disabled ? undefined : "primary.main",
          },
          "&:focus": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
        }}
      />
      <TextField
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        size={size}
        disabled={disabled}
        placeholder="#000000"
        slotProps={{
          input: {
            endAdornment: value ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  disabled={disabled}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{ width: 140 }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2 }}>
          <HexColorPicker color={displayColor} onChange={handlePickerChange} />
        </Box>
      </Popover>
    </Box>
  )
}
