"use client"

import { useRef, useEffect, useCallback } from "react"
import { Box, OutlinedInput } from "@mui/material"
import { styled } from "@mui/material/styles"

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

const StyledInput = styled(OutlinedInput)(({ theme }) => ({
  width: 48,
  height: 56,
  "& .MuiOutlinedInput-input": {
    padding: 0,
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: 500,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.divider,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}))

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  // Convert value string to array of digits
  const digits = value.split("").slice(0, length)
  while (digits.length < length) {
    digits.push("")
  }

  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < length && inputRefs.current[index]) {
        inputRefs.current[index]?.focus()
      }
    },
    [length]
  )

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Only accept digits
      const digit = inputValue.replace(/\D/g, "").slice(-1)

      if (digit) {
        const newDigits = [...digits]
        newDigits[index] = digit
        const newValue = newDigits.join("")
        onChange(newValue)

        // Auto-focus next input
        if (index < length - 1) {
          focusInput(index + 1)
        }

        // Check if complete
        if (newValue.length === length && !newValue.includes("")) {
          onComplete(newValue)
        }
      }
    },
    [digits, length, onChange, onComplete, focusInput]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        const newDigits = [...digits]

        if (digits[index]) {
          // Clear current input
          newDigits[index] = ""
          onChange(newDigits.join(""))
        } else if (index > 0) {
          // Move to previous input and clear it
          newDigits[index - 1] = ""
          onChange(newDigits.join(""))
          focusInput(index - 1)
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault()
        focusInput(index - 1)
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault()
        focusInput(index + 1)
      }
    },
    [digits, length, onChange, focusInput]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text")
      const pastedDigits = pastedData.replace(/\D/g, "").slice(0, length)

      if (pastedDigits) {
        onChange(pastedDigits)

        // Focus appropriate input after paste
        if (pastedDigits.length >= length) {
          focusInput(length - 1)
          // Auto-submit if complete
          onComplete(pastedDigits)
        } else {
          focusInput(pastedDigits.length)
        }
      }
    },
    [length, onChange, onComplete, focusInput]
  )

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }, [])

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        justifyContent: "center",
      }}
    >
      {digits.map((digit, index) => (
        <StyledInput
          key={index}
          inputRef={el => {
            inputRefs.current[index] = el
          }}
          value={digit}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          disabled={disabled}
          inputProps={{
            maxLength: 1,
            inputMode: "numeric",
            pattern: "[0-9]*",
            "aria-label": `Digit ${index + 1} of ${length}`,
          }}
        />
      ))}
    </Box>
  )
}
