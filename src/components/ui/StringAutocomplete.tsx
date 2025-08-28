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

type StringAutocompleteProps = {
  model: string
  value: AutocompleteOption | string | null
  onChange: (value: AutocompleteOption | string | null) => void
  records: AutocompleteOption[] | string[]
  allowNone?: boolean
  sx?: Record<string, unknown>
  groupBy?: (option: AutocompleteOption) => string
  renderGroup?: (params: AutocompleteRenderGroupParams) => React.ReactNode
  disabled?: boolean
}

export function StringAutocomplete({
  model,
  value,
  onChange,
  records,
  sx,
  allowNone,
  groupBy,
  renderGroup,
  disabled = false,
}: StringAutocompleteProps) {
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
