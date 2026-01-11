"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  CircularProgress,
  InputAdornment,
} from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material"
import { useClient } from "@/contexts"

interface TagSearchInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagSearchInput({
  value,
  onChange,
  placeholder = "Search by AI tags...",
}: TagSearchInputProps) {
  const { client } = useClient()
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Fetch available tags on mount
  useEffect(() => {
    let cancelled = false

    async function fetchTags() {
      setLoading(true)
      try {
        const response = await client.getAiTags()
        if (!cancelled) {
          setAvailableTags(response.data.tags || [])
        }
      } catch (error) {
        // Silently handle errors (e.g., no campaign selected)
        // User can still type free-form tags
        if (!cancelled) {
          setAvailableTags([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTags()

    return () => {
      cancelled = true
    }
  }, [client])

  // Filter options based on input
  const filterOptions = useCallback(
    (options: string[], { inputValue }: { inputValue: string }) => {
      const searchTerm = inputValue.toLowerCase()
      if (!searchTerm) return options.slice(0, 20) // Show first 20 when no input

      return options
        .filter(tag => tag.toLowerCase().includes(searchTerm))
        .slice(0, 20)
    },
    []
  )

  return (
    <Autocomplete
      multiple
      freeSolo
      options={availableTags}
      value={value}
      onChange={(_, newValue) => {
        onChange(newValue)
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue)
      }}
      filterOptions={filterOptions}
      loading={loading}
      size="small"
      sx={{ minWidth: 250, maxWidth: 400 }}
      renderTags={(tagValues, getTagProps) =>
        tagValues.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index })
          return (
            <Chip
              key={key}
              label={option}
              size="small"
              {...tagProps}
              sx={{ height: 24 }}
            />
          )
        })
      }
      renderInput={params => (
        <TextField
          {...params}
          placeholder={value.length === 0 ? placeholder : ""}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={16} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props
        return (
          <Box component="li" key={key} {...optionProps} sx={{ py: 0.5 }}>
            <Chip label={option} size="small" variant="outlined" />
          </Box>
        )
      }}
    />
  )
}
