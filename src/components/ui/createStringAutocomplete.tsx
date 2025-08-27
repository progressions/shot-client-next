"use client"
import {
  Autocomplete,
  TextField,
  AutocompleteRenderGroupParams,
} from "@mui/material"
import { useMemo } from "react"

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
  disabled?: boolean
  sx?: Record<string, unknown>
}

function createStringAutocomplete(model: string) {
  return function StringAutocomplete({
    value,
    onChange,
    records,
    sx,
    allowNone,
    groupBy,
    renderGroup,
    disabled = false,
  }: Omit<ModelAutocompleteProps, "onInputChange" | "filters"> & {
    allowNone?: boolean
    groupBy?: (option: AutocompleteOption) => string
    renderGroup?: (params: AutocompleteRenderGroupParams) => React.ReactNode
  }) {
    const noneOption: AutocompleteOption = { id: NONE_VALUE, name: "None" }
    const options = useMemo(() => {
      const opts = allowNone
        ? [
            noneOption,
            ...records.map(item => ({
              id: String(item),
              name: String(item),
            })),
          ]
        : records
            .filter(item => item)
            .map(item => ({
              id: String(item),
              name: String(item),
            }))
      return opts
    }, [records, allowNone])
    return (
      <Autocomplete
        options={options}
        getOptionLabel={option => String(option.name)}
        value={options.find(option => option.id === value) || null}
        onChange={(event, newValue) => onChange(newValue ? newValue.id : null)}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        groupBy={groupBy}
        renderGroup={renderGroup}
        renderInput={params => (
          <TextField
            {...params}
            label={`${model}`}
            variant="outlined"
            InputProps={{ ...params.InputProps }}
          />
        )}
        sx={sx}
        disabled={disabled}
      />
    )
  }
}

export { createStringAutocomplete }