"use client"
import { TextField } from "@mui/material"
import { useCallback, useState, useEffect } from "react"
import { debounce } from "lodash"

interface SearchInputProps {
  name?: string
  placeholder: string
  sx?: Record<string, unknown>
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
}

export function SearchInput({ name, value: initialValue, placeholder, sx, onFiltersUpdate }: SearchInputProps) {
  const [value, setValue] = useState<string | null>(initialValue)

  const debouncedOnFiltersUpdate = useCallback(
    debounce((newValue: string) => {
      onFiltersUpdate(newValue)
    }, 300),
    [onFiltersUpdate]
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setValue(newValue)
    debouncedOnFiltersUpdate(newValue)
  }

  return (
      <TextField
        name={name}
        value={value || ""}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
  )
}
