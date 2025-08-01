"use client"

import { useEffect, useMemo, useRef } from "react"
import {
  Autocomplete as MuiAutocomplete,
  TextField,
  styled,
  CircularProgress,
} from "@mui/material"
import { FormActions, useForm } from "@/reducers"

export interface Option {
  label: string
  value: string
}

interface AutocompleteProperties {
  label: string
  fetchOptions: (query: string) => Promise<Option[]>
  onChange: (value: string | null) => void
  value: string | null
  exclude?: string[]
  allowNone?: boolean
}

const StyledAutocomplete = styled(MuiAutocomplete)(({ theme }) => ({
  "& .MuiInputBase-root": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.divider,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiAutocomplete-popupIndicator": {
    color: theme.palette.text.secondary,
  },
  "& .MuiAutocomplete-clearIndicator": {
    color: theme.palette.text.secondary,
  },
  "& .MuiAutocomplete-listbox": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
})) as typeof MuiAutocomplete

type FormStateData = {
  options: Option[]
}

const NONE_VALUE = "__NONE__"

export function Autocomplete({
  label,
  fetchOptions,
  onChange,
  value,
  allowNone = true,
  exclude = [],
}: AutocompleteProperties) {
  const { formState, dispatchForm } = useForm<FormStateData>({
    options: [],
  })
  const { loading } = formState
  const { options } = formState.data
  const inputReference = useRef("")

  const noneOption: Option = useMemo(
    () => ({ label: "None", value: NONE_VALUE }),
    []
  )

  const displayOptions = useMemo(() => {
    const filteredOptions = options.filter(
      option => !exclude.includes(option.value)
    )
    return allowNone ? [noneOption, ...filteredOptions] : filteredOptions
  }, [options, noneOption, allowNone, exclude])

  const selectedOption = useMemo(() => {
    if (value === null) {
      return noneOption
    }
    return options.find(option => option.value === value) || null
  }, [options, value, noneOption])

  // Initial fetch on mount
  useEffect(() => {
    dispatchForm({ type: FormActions.EDIT, name: "loading", value: true })
    fetchOptions("").then(initialOptions => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "options",
        value: initialOptions,
      })
      dispatchForm({ type: FormActions.SUCCESS })
    })
  }, [fetchOptions, dispatchForm])

  return (
    <StyledAutocomplete
      sx={{ width: "100%" }}
      getOptionLabel={(option: Option) => option.label}
      filterOptions={x => x}
      options={displayOptions}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={selectedOption}
      noOptionsText="No options"
      onChange={(_event: React.SyntheticEvent, newValue: Option | null) => {
        if (newValue?.value === NONE_VALUE || newValue === null) {
          onChange(null)
        } else {
          onChange(newValue?.value || null)
        }
      }}
      onInputChange={(_event, newInputValue, reason) => {
        inputReference.current = newInputValue
        if (reason === "input" || reason === "clear") {
          // dispatchForm({ type: FormActions.SUBMIT })

          fetchOptions(newInputValue).then(newOptions => {
            if (inputReference.current === newInputValue) {
              dispatchForm({
                type: FormActions.UPDATE,
                name: "options",
                value: newOptions,
              })
              dispatchForm({
                type: FormActions.EDIT,
                name: "loading",
                value: false,
              })
            }
          })
        }
      }}
      renderInput={parameters => (
        <TextField
          {...parameters}
          label={label || "Select an option"}
          variant="outlined"
          InputLabelProps={{
            style: { color: "inherit" },
          }}
          InputProps={{
            ...parameters.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {parameters.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      loading={loading}
    />
  )
}
