"use client"
import { useState } from "react"
import { Box, Stack, IconButton, FormControl, InputLabel } from "@mui/material"
import { TextField } from "./TextField"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { SystemStyleObject, Theme } from "@mui/system"
import { useTheme } from "@mui/material/styles"

/**
 * Props for the NumberField component.
 */
type NumberFieldProps = {
  /** The name attribute for the input field, used for form identification */
  name: string
  /** The current value of the field - can be a number, null, or string representation */
  value: number | null | string
  /** Size preset affecting font size and padding - "small" for compact displays, "large" for prominent fields (default: "large") */
  size: "small" | "large"
  /** Custom width for the field (CSS value like "100px" or "8rem") */
  width: string
  /** Whether the field is in an error state, affecting visual styling */
  error: boolean
  /** Callback fired when the input value changes */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Callback fired when the input loses focus - also triggered by increment/decrement buttons */
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  /** Additional MUI sx styles to apply to the input. Defaults to an empty object (`{}`). */
  sx?: SystemStyleObject<Theme>
  /** Optional label text displayed above the field */
  label?: string
  /** Background color for the label - defaults to "#262626" for dark theme compatibility */
  labelBackgroundColor?: string
}

/**
 * A numeric input field with increment/decrement buttons.
 *
 * Features:
 * - Centered numeric display with configurable size presets
 * - Increment (+) and decrement (-) buttons that appear on hover/focus
 * - Smooth slide-in animation for the control buttons
 * - Optional floating label with customizable background
 * - Integrates with form state via onChange and onBlur callbacks
 *
 * The increment/decrement buttons trigger both onChange and onBlur to ensure
 * immediate persistence of value changes.
 *
 * @example
 * ```tsx
 * <NumberField
 *   name="wounds"
 *   value={character.wounds}
 *   size="large"
 *   width="140px"
 *   error={false}
 *   onChange={handleChange}
 *   onBlur={handleBlur}
 *   label="Wounds"
 * />
 * ```
 */
export function NumberField({
  name,
  value,
  size = "large",
  width,
  error,
  onChange,
  onBlur,
  sx = {},
  label,
  labelBackgroundColor,
}: NumberFieldProps) {
  const theme = useTheme()
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const fontSizeMap = {
    small: { xs: "1.25rem", sm: "1.5rem" },
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
    const fakeEvent = {
      target: { name, value: newValue.toString() },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(fakeEvent)
    // Also trigger onBlur to save the change
    const fakeBlurEvent = {
      target: { name, value: newValue.toString() },
    } as React.FocusEvent<HTMLInputElement>
    onBlur(fakeBlurEvent)
  }

  const handleDecrement = () => {
    const currentValue = Number(value) || 0
    const newValue = currentValue - 1
    const fakeEvent = {
      target: { name, value: newValue.toString() },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(fakeEvent)
    // Also trigger onBlur to save the change
    const fakeBlurEvent = {
      target: { name, value: newValue.toString() },
    } as React.FocusEvent<HTMLInputElement>
    onBlur(fakeBlurEvent)
  }

  if (!onBlur) throw "WTF"

  return (
    <FormControl sx={{ minWidth: width || widthMap[size] }}>
      {label && (
        <InputLabel
          shrink
          sx={{
            opacity: 1,
            backgroundColor: labelBackgroundColor || "#262626",
            px: 0.5,
            ml: -0.5,
          }}
        >
          {label}
        </InputLabel>
      )}
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
    </FormControl>
  )
}
