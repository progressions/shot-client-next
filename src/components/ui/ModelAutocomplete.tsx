"use client"
import { Autocomplete, TextField, CircularProgress } from "@mui/material"
import { useClient } from "@/contexts"
import { useState, useEffect, useCallback, useMemo } from "react"
import { debounce } from "lodash"
import { getApiMethodForModel } from "@/lib/modelApiMapping"

interface AutocompleteOption {
  id: number | string
  name: string
}

const NONE_VALUE = "__NONE__"

type ModelAutocompleteProps = {
  model: string
  value: AutocompleteOption | string | null
  onChange: (value: AutocompleteOption | string | null) => void
  onInputChange?: (
    event: React.SyntheticEvent,
    value: string,
    reason: "input" | "reset" | "clear"
  ) => void
  filters: Record<string, string | boolean>
  records: AutocompleteOption[] | string[]
  allowNone: boolean
  disabled?: boolean
  sx?: Record<string, unknown>
}

export function ModelAutocomplete({
  model,
  value,
  onChange,
  onInputChange,
  filters,
  records,
  allowNone = true,
  disabled,
  sx,
}: ModelAutocompleteProps) {
  const { client } = useClient()
  const [options, setOptions] = useState<AutocompleteOption[]>(
    records as AutocompleteOption[]
  )
  const [loading, setLoading] = useState(false)

  // Memoize noneOption to prevent recreation on every render
  const noneOption = useMemo<AutocompleteOption>(
    () => ({ id: NONE_VALUE, name: "None" }),
    []
  )

  // Use JSON.stringify directly in dependency arrays to detect content changes
  // This is simpler and more honest than attempting complex memoization patterns

  const fetchRecords = useCallback(async () => {
    if (disabled || !model) {
      return
    }

    // If records are provided and filters are empty, just use the provided records
    // This handles the common case where GenericFilter pre-fetches data
    if (records?.length && (!filters || Object.keys(filters).length === 0)) {
      setOptions(
        allowNone
          ? [noneOption, ...(records as AutocompleteOption[])]
          : (records as AutocompleteOption[])
      )
      return
    }

    // Try to fetch data using the API
    const apiMethod = getApiMethodForModel(model)
    if (!apiMethod) {
      // No API method found, fall back to provided records
      console.warn(`No API method found for model: ${model}`)
      setOptions(
        allowNone
          ? [noneOption, ...(records as AutocompleteOption[])]
          : (records as AutocompleteOption[])
      )
      return
    }

    setLoading(true)
    try {
      console.log("about to call apiMethod", apiMethod)
      // Call the appropriate API method
      const response = await apiMethod(client, filters)

      console.log("Just fetched", model, filters, response.data)

      // Model comes in as capitalized plural (e.g., "Weapons", "Parties")
      // Data is always at response.data.[lowercase plural]
      const collectionName = model.toLowerCase()
      const data = response.data[collectionName]

      console.log("Model:", model, "Collection:", collectionName, "Data:", data)

      if (data && Array.isArray(data)) {
        // Map the response data to options
        const newOptions = data.map(
          (record: { id: number | string; name?: string; title?: string }) => ({
            id: record.id,
            name: record.name || record.title || String(record.id),
          })
        )
        console.log("Setting options", newOptions)
        setOptions(allowNone ? [noneOption, ...newOptions] : newOptions)
      } else {
        // No data returned
        setOptions(
          allowNone
            ? [noneOption, ...(records as AutocompleteOption[])]
            : (records as AutocompleteOption[])
        )
      }
    } catch (error) {
      console.error(`Error fetching ${model} records:`, error)
      // On error, fall back to provided records
      setOptions(
        allowNone
          ? [noneOption, ...(records as AutocompleteOption[])]
          : (records as AutocompleteOption[])
      )
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- use JSON.stringify for content-based comparison
  }, [
    client,
    model,
    JSON.stringify(filters),
    JSON.stringify(records),
    allowNone,
    disabled,
    noneOption,
  ])

  const debouncedFetch = useMemo(
    () => debounce(fetchRecords, 100),
    [fetchRecords]
  )

  useEffect(() => {
    debouncedFetch()
    return () => {
      debouncedFetch.cancel()
    }
  }, [debouncedFetch])

  return (
    <Autocomplete
      options={options}
      getOptionLabel={option => option.name}
      getOptionKey={option => String(option.id)}
      value={options.find(option => option.id === value) || null}
      onChange={(event, newValue) => onChange(newValue)}
      onInputChange={onInputChange}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderInput={params => (
        <TextField
          {...params}
          label={`${model}`}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={sx}
      disabled={disabled}
    />
  )
}
