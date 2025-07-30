import React, { useEffect, useMemo, useRef } from "react"
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

interface AutocompleteProps {
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
}: AutocompleteProps) {
  const { formState, dispatchForm } = useForm<FormStateData>({
    options: [],
  })
  const { loading } = formState
  const { options } = formState.data
  const inputRef = useRef("")
  const fetchedMissing = useRef(new Set<string>())

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
    dispatchForm({ type: FormActions.SUBMIT })

    fetchOptions("").then(initialOptions => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "options",
        value: initialOptions,
      })
      dispatchForm({ type: FormActions.EDIT, name: "loading", value: false })
    })
  }, [fetchOptions, dispatchForm])

  // Fetch for missing selected value
  useEffect(() => {
    if (
      value !== null &&
      !options.some(option => option.value === value) &&
      !fetchedMissing.current.has(value)
    ) {
      fetchedMissing.current.add(value)
      dispatchForm({ type: FormActions.SUBMIT })

      fetchOptions(value).then(newOptions => {
        let updatedOptions = [...newOptions, ...options]
        // If still not found, add a placeholder
        if (!newOptions.some(o => o.value === value)) {
          updatedOptions = [{ label: value, value: value }, ...updatedOptions]
        }
        dispatchForm({
          type: FormActions.UPDATE,
          name: "options",
          value: updatedOptions,
        })
        dispatchForm({ type: FormActions.EDIT, name: "loading", value: false })
      })
    }
  }, [value, options, fetchOptions, dispatchForm])

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
        inputRef.current = newInputValue
        if (reason === "input" || reason === "clear") {
          dispatchForm({ type: FormActions.SUBMIT })

          fetchOptions(newInputValue).then(newOptions => {
            if (inputRef.current === newInputValue) {
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
      renderInput={params => (
        <TextField
          {...params}
          label={label || "Select an option"}
          variant="outlined"
          InputLabelProps={{
            style: { color: "inherit" },
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      loading={loading}
    />
  )
}
