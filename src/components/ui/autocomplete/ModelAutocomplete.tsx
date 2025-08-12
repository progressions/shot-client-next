// components/ui/ModelAutocomplete.tsx
"use client"
import { useState, useEffect } from "react"
import { Autocomplete, TextField, CircularProgress } from "@mui/material"
import type { SxProps, Theme } from "@mui/material"

interface AutocompleteOption {
  id: number
  name: string
}

interface ModelAutocompleteProps<T> {
  fetchOptions?: () => Promise<T[]>
  getOptionLabel: (option: T) => string
  label: string
  value: T | null
  onChange: (value: T | null) => void
  records?: T[]
  sx?: SxProps<Theme>
}

export function ModelAutocomplete<T extends AutocompleteOption>({
  fetchOptions,
  getOptionLabel,
  label,
  value,
  onChange,
  records,
  sx,
}: ModelAutocompleteProps<T>) {
  const [options, setOptions] = useState<T[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (records) {
      setOptions(records)
      return
    }

    if (fetchOptions) {
      setLoading(true)
      fetchOptions()
        .then(data => setOptions(data))
        .catch(error => console.error("Failed to fetch options:", error))
        .finally(() => setLoading(false))
    }
  }, [fetchOptions, records])

  return (
    <Autocomplete
      options={options}
      getOptionLabel={getOptionLabel}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      loading={loading}
      sx={sx}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && options.length === 0 ? (
                  <CircularProgress size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
