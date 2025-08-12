"use client"
import { Autocomplete, TextField, CircularProgress } from "@mui/material"
import { useClient } from "@/contexts"
import { useState, useEffect, useCallback, useMemo } from "react"
import { debounce } from "lodash"
import pluralize from "pluralize"

interface AutocompleteOption {
  id: number | string
  name: string
}

const NONE_VALUE = "__NONE__"

type ModelAutocompleteProps = {
  value: AutocompleteOption | string | null
  onChange: (value: AutocompleteOption | string | null) => void
  onInputChange?: (event: React.SyntheticEvent, value: string) => void
  filters: Record<string, string | boolean>
  records: AutocompleteOption[] | string[]
  allowNone: boolean
  sx?: Record<string, unknown>
}

export function createAutocomplete(model: string) {
  return function ModelAutocomplete({
    value,
    onChange,
    onInputChange,
    filters,
    records,
    allowNone = true,
    sx,
  }: ModelAutocompleteProps) {
    const { client } = useClient()
    const [options, setOptions] = useState<AutocompleteOption[]>(
      records as AutocompleteOption[]
    )
    const [loading, setLoading] = useState(false)

    const noneOption: AutocompleteOption = { id: NONE_VALUE, name: "None" }

    const fetchRecords = useCallback(
      debounce(async () => {
        try {
          setLoading(true)
          const response = await client[
            `get${pluralize(model)}` as keyof typeof client
          ]({
            autocomplete: true,
            per_page: 200,
            ...filters,
          })
          const fetchedOptions =
            response.data[pluralize(model.toLowerCase())] || []
          if (allowNone) {
            setOptions([noneOption, ...fetchedOptions])
          } else {
            setOptions(fetchedOptions)
          }
        } catch (error) {
          console.error(
            `Failed to fetch ${pluralize(model.toLowerCase())}:`,
            error
          )
        } finally {
          setLoading(false)
        }
      }, 300),
      [client, filters]
    )

    useEffect(() => {
      if (allowNone) {
        setOptions([noneOption, ...records] as AutocompleteOption[])
      } else {
        setOptions(records as AutocompleteOption[])
      }
      if (!records.length) {
        fetchRecords()
      }
      return () => {
        fetchRecords.cancel()
      }
    }, [fetchRecords, records])

    return (
      <Autocomplete
        options={options}
        getOptionLabel={option => option.name}
        value={value as AutocompleteOption | null}
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
      />
    )
  }
}

export function createStringAutocomplete(model: string) {
  return function StringAutocomplete({
    value,
    onChange,
    records,
    allowNone = true,
    sx,
  }: Omit<ModelAutocompleteProps, "onInputChange" | "filters">) {
    const noneOption: AutocompleteOption = { id: NONE_VALUE, name: "None" }

    const options = useMemo(
      () =>
        [
          allowNone ? noneOption : null,
          ...(records as string[]).map(item => ({
            id: String(item),
            name: String(item),
          })),
        ].filter(option => option !== null),
      [records]
    )

    return (
      <Autocomplete
        options={options}
        getOptionLabel={option => String(option.name)}
        value={options.find(option => option.id === value) || null}
        onChange={(event, newValue) => onChange(newValue?.id)}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        renderInput={params => (
          <TextField
            {...params}
            label={`${model}`}
            variant="outlined"
            InputProps={{ ...params.InputProps }}
          />
        )}
        sx={sx}
      />
    )
  }
}
