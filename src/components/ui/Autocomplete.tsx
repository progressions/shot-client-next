"use client"
import { useEffect, useMemo, useRef } from "react"
import {
  Autocomplete as MuiAutocomplete,
  TextField,
  styled,
  CircularProgress,
  Divider,
  ListSubheader,
  AutocompleteProps as MuiAutocompleteProps,
  Box,
} from "@mui/material"
import { FormActions, useForm } from "@/reducers"

/**
 * Option structure for the Autocomplete component.
 *
 * @property label - Display text shown in the dropdown
 * @property value - Unique identifier value (usually entity ID)
 * @property group - Optional group name for grouped options
 * @property isDivider - If true, renders as a divider instead of selectable option
 */
export interface Option {
  label: string
  value: string
  group?: string
  isDivider?: boolean
}

/**
 * Props for the Autocomplete component.
 *
 * @property label - Label text for the input field
 * @property fetchOptions - Async function to fetch options based on search query
 * @property onChange - Callback when selection changes (receives value string or null)
 * @property value - Currently selected value (ID string or null)
 * @property exclude - Array of values to exclude from options
 * @property allowNone - Whether to show "None" option (defaults to true)
 * @property freeSolo - Allow arbitrary text input (defaults to false)
 */
interface AutocompleteProperties extends Partial<
  MuiAutocompleteProps<Option, false, false, boolean>
> {
  label: string
  fetchOptions: (query: string) => Promise<Option[]>
  onChange: (value: string | null) => void
  value: string | null
  exclude?: string[]
  allowNone?: boolean
  freeSolo?: boolean
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

const StyledListSubheader = styled(ListSubheader)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.background.paper,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}))

type FormStateData = {
  options: Option[]
}

const NONE_VALUE = "__NONE__"

/**
 * Generic async autocomplete component with search-as-you-type functionality.
 *
 * Features:
 * - Async option fetching with loading indicator
 * - Optional "None" selection
 * - Option exclusion (hide already-selected items)
 * - Free-form text input mode (freeSolo)
 * - Grouped options with dividers
 * - Themed styling matching app design
 *
 * @example
 * ```tsx
 * <Autocomplete
 *   label="Select Character"
 *   value={characterId}
 *   onChange={setCharacterId}
 *   fetchOptions={async (query) => {
 *     const { data } = await client.getCharacters({ search: query })
 *     return data.map(c => ({ label: c.name, value: c.id }))
 *   }}
 *   exclude={existingCharacterIds}
 * />
 * ```
 */
export function Autocomplete({
  label,
  fetchOptions,
  onChange,
  value,
  allowNone = true,
  freeSolo = false,
  exclude = [],
  ...muiProps
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
      option => !exclude.includes(option.value) || option.isDivider
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
      filterOptions={(options, { inputValue }) => {
        if (
          freeSolo &&
          inputValue &&
          !options.some(
            opt => opt.label.toLowerCase() === inputValue.toLowerCase()
          )
        ) {
          return [
            { label: `Create "${inputValue}"`, value: inputValue },
            ...options,
          ]
        }
        return options
      }}
      options={displayOptions}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={selectedOption}
      noOptionsText="No options"
      freeSolo={freeSolo}
      onChange={(
        _event: React.SyntheticEvent,
        newValue: Option | string | null
      ) => {
        if (typeof newValue === "string") {
          // Handle free text input when freeSolo is true
          if (freeSolo) {
            const newOption = { label: newValue, value: newValue }
            dispatchForm({
              type: FormActions.UPDATE,
              name: "options",
              value: [...options, newOption],
            })
            onChange(newValue)
          }
        } else if (newValue?.value === NONE_VALUE || newValue === null) {
          onChange(null)
        } else {
          onChange(newValue?.value || null)
        }
      }}
      onInputChange={(_event, newInputValue, reason) => {
        inputReference.current = newInputValue
        if (reason === "input" || reason === "clear") {
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
      renderOption={(props, option: Option) => {
        // Use option.value as key instead of label to handle duplicate names
        const { key, ...otherProps } = props as {
          key: string
          [key: string]: unknown
        }
        return (
          <Box component="li" {...otherProps} key={option.value}>
            {option.label}
          </Box>
        )
      }}
      renderGroup={params =>
        params.group === "" ? (
          <Divider key={params.key} />
        ) : (
          <li key={params.key}>
            <StyledListSubheader>{params.group}</StyledListSubheader>
            {params.children}
          </li>
        )
      }
      loading={loading}
      {...muiProps}
    />
  )
}
