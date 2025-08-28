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
  model: string
  value: AutocompleteOption | string | null
  onChange: (value: AutocompleteOption | string | null) => void
  onInputChange?: (event: React.SyntheticEvent, value: string) => void
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

  const noneOption: AutocompleteOption = { id: NONE_VALUE, name: "None" }

  const fetchRecords = useCallback(async () => {
    if (disabled || (!model && !records?.length)) {
      return
    }

    setLoading(true)
    try {
      const pluralModel = pluralize(model.toLowerCase())
      let response: any

      const clientMethod = (client as any)[pluralModel]
      if (typeof clientMethod === "object" && "index" in clientMethod) {
        response = await clientMethod.index({
          filters: filters || {},
        })
      } else if (
        typeof client[pluralModel as keyof typeof client] === "function"
      ) {
        response = await (client as any)[pluralModel]({
          filters: filters || {},
        })
      } else {
        console.warn(`No client method found for ${pluralModel}`)
        setOptions(
          allowNone
            ? [noneOption, ...(records as AutocompleteOption[])]
            : (records as AutocompleteOption[])
        )
        setLoading(false)
        return
      }

      if (response?.data) {
        const newOptions = response.data.map((record: any) => ({
          id: record.id,
          name: record.name || record.title || record.id,
        }))
        setOptions(allowNone ? [noneOption, ...newOptions] : newOptions)
      } else {
        setOptions(
          allowNone
            ? [noneOption, ...(records as AutocompleteOption[])]
            : (records as AutocompleteOption[])
        )
      }
    } catch (error) {
      console.error(`Error fetching ${model} records:`, error)
      setOptions(
        allowNone
          ? [noneOption, ...(records as AutocompleteOption[])]
          : (records as AutocompleteOption[])
      )
    } finally {
      setLoading(false)
    }
  }, [client, model, filters, records, allowNone, disabled])

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
