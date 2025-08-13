"use client"
import { TextField, Stack, Alert } from "@mui/material"
import {
  createAutocomplete,
  createStringAutocomplete,
  AddButton,
} from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"
import { debounce } from "lodash"
import { useForm, FormActions } from "@/reducers"
import pluralize from "pluralize"

interface AutocompleteOption {
  id: number | string
  name: string
}

interface FilterFieldConfig {
  name: string
  type: "entity" | "string" | "static" | "search"
  staticOptions?: string[]
  responseKey?: string
  allowNone?: boolean
}

interface FilterConfig {
  entityName: string
  fields: FilterFieldConfig[]
  responseKeys: Record<string, string>
}

export function createFilterComponent(config: FilterConfig) {
  const { entityName, fields, responseKeys } = config
  const pluralEntityName = pluralize(entityName)
  const MainAutocomplete = fields.find(f => f.name === entityName.toLowerCase())
    ? createAutocomplete(entityName)
    : null
  const fieldAutocompletes = fields.reduce(
    (acc, field) => {
      if (field.name === entityName.toLowerCase()) return acc
      if (field.type === "entity") {
        acc[field.name] = createAutocomplete(
          field.name.charAt(0).toUpperCase() + field.name.slice(1)
        )
      } else if (field.type === "string" || field.type === "static") {
        acc[field.name] = createStringAutocomplete(
          field.name.charAt(0).toUpperCase() + field.name.slice(1)
        )
      } else if (field.type === "search") {
        acc[field.name] = TextField
      }
      return acc
    },
    {} as Record<string, React.ComponentType<unknown>>
  )

  const filterMapper = (
    selections: Record<string, AutocompleteOption | string | null>,
    search: string,
    omit: string[]
  ) => {
    const filters: Record<string, string | boolean> = {}
    if (search) {
      filters.search = search
    }
    fields.forEach(field => {
      if (
        omit.includes(field.name) ||
        selections[field.name] === null ||
        selections[field.name] === ""
      )
        return
      if (field.type === "entity") {
        filters[`${field.name}_id`] = String(
          (selections[field.name] as AutocompleteOption).id
        )
      } else {
        filters[field.name] = selections[field.name] as string
      }
    })
    return filters
  }

  type FilterProps = {
    onChange: (value: AutocompleteOption | null) => void
    onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
    omit?: string[]
    excludeIds?: number[]
    sx?: Record<string, unknown>
  }

  return function GeneratedFilter({
    onChange,
    onFiltersUpdate,
    omit = [],
    excludeIds = [],
    sx,
  }: FilterProps) {
    console.log("GeneratedFilter render", {
      entityName,
      fields: fields.map(f => f.name),
      omit,
      excludeIds,
    })
    const { client } = useClient()
    const { formState, dispatchForm } = useForm(
      fields.reduce(
        (acc, field) => {
          acc[field.name] = null
          return acc
        },
        {} as Record<string, AutocompleteOption | string | null>
      )
    )
    const [records, setRecords] = useState<
      Record<string, AutocompleteOption[] | string[]>
    >({})
    const [keys, setKeys] = useState<Record<string, string>>(
      fields.reduce(
        (acc, field) => {
          acc[field.name] = `${field.name}-0`
          return acc
        },
        {} as Record<string, string>
      )
    )
    const [keyCounter, setKeyCounter] = useState(1)
    const [mainSearch, setMainSearch] = useState("")
    const [error, setError] = useState<string | null>(null)

    const stableOmit = omit
    const stableOnFiltersUpdate = (
      filters: Record<string, string | boolean>
    ) => {
      console.log("onFiltersUpdate called", { filters })
      onFiltersUpdate?.(filters)
    }

    const filters = filterMapper(formState.data, mainSearch, stableOmit)
    console.log("Filters computed", filters, {
      formStateData: formState.data,
      mainSearch,
      stableOmit,
    })

    const filteredMainRecords =
      records[entityName.toLowerCase()]?.filter(
        (record: AutocompleteOption) =>
          !excludeIds.includes(record.id as number)
      ) || []
    console.log("filteredMainRecords computed", {
      records: filteredMainRecords.length,
      excludeIds,
    })

    const debouncedSetMainSearch = debounce((value: string) => {
      console.log("debouncedSetMainSearch called", { value })
      setMainSearch(value)

      const newFilters = filterMapper(formState.data, value, stableOmit)
      console.log(
        "Calling onFiltersUpdate and fetchRecords from debouncedSetMainSearch",
        { newFilters }
      )
      stableOnFiltersUpdate(newFilters)
      fetchRecords(newFilters)
    }, 300)

    const fetchRecords = debounce(
      async (customFilters?: Record<string, string | boolean>) => {
        const activeFilters = customFilters // || filters
        console.log("fetchRecords called", {
          filters: activeFilters,
          entityName,
        })
        try {
          const response = await client[
            `get${pluralEntityName}` as keyof typeof client
          ]({
            autocomplete: true,
            per_page: 200,
            ...activeFilters,
          })
          const newRecords = fields.reduce(
            (acc, field) => {
              const key = responseKeys[field.name] || field.name
              if (field.type === "static") {
                acc[field.name] = field.staticOptions || []
              } else if (field.type === "string") {
                acc[field.name] =
                  response.data[key]
                    ?.filter(
                      (item: string | number | null) =>
                        item != null && String(item).trim() !== ""
                    )
                    .map((item: string | number) => String(item)) || []
              } else {
                acc[field.name] = response.data[key] || []
              }
              return acc
            },
            {} as Record<string, AutocompleteOption[] | string[]>
          )
          setRecords(newRecords)
          setError(null)
        } catch (error) {
          const errorMessage = `Failed to fetch ${entityName.toLowerCase()} records. Please try again.`
          console.error(errorMessage, error)
          setError(errorMessage)
        }
      },
      300
    )

    useEffect(() => {
      fetchRecords(filters)
      return () => {
        fetchRecords.cancel()
      }
    }, [])

    const handleAdd = () => {
      const mainField = entityName.toLowerCase()
      if (formState.data[mainField]) {
        console.log("handleAdd called", {
          selected: formState.data[mainField],
          prevData: formState.data,
        })
        onChange(formState.data[mainField] as AutocompleteOption)
        // Reset all fields
        fields.forEach(field => {
          dispatchForm({
            type: FormActions.UPDATE,
            name: field.name,
            value: null,
          })
        })
        setKeys(prev => ({
          ...prev,
          ...fields.reduce(
            (acc, field) => {
              acc[field.name] = `${field.name}-${keyCounter}`
              return acc
            },
            {} as Record<string, string>
          ),
        }))
        setKeyCounter(prev => prev + 1)
        const newFilters = filterMapper(
          fields.reduce(
            (acc, field) => {
              acc[field.name] = null
              return acc
            },
            {} as Record<string, AutocompleteOption | string | null>
          ),
          "",
          stableOmit
        )
        console.log("Calling onFiltersUpdate and fetchRecords from handleAdd", {
          newFilters,
        })
        stableOnFiltersUpdate(newFilters)
        fetchRecords(newFilters)
      }
    }

    const handleChange =
      (field: string) => (value: AutocompleteOption | string | null) => {
        console.log("handleChange called", {
          field,
          value,
          prevData: formState.data,
        })
        dispatchForm({ type: FormActions.UPDATE, name: field, value })
        const newSelections = { ...formState.data, [field]: value }
        console.log("New selections after update", newSelections)
        if (field !== entityName.toLowerCase()) {
          const newFilters = filterMapper(newSelections, mainSearch, stableOmit)
          console.log(
            "Calling onFiltersUpdate and fetchRecords from handleChange",
            { newFilters }
          )
          stableOnFiltersUpdate(newFilters)
          fetchRecords(newFilters)
        }
        if (
          field === entityName.toLowerCase() &&
          stableOmit.includes("add") &&
          value &&
          onChange
        ) {
          console.log("onChange triggered from main field", { value })
          onChange(value as AutocompleteOption)
          dispatchForm({ type: FormActions.UPDATE, name: field, value: null })
          setKeys(prev => ({ ...prev, [field]: `${mainField}-${keyCounter}` }))
          setKeyCounter(prev => prev + 1)
        }
      }

    const handleInputChange = (event: React.SyntheticEvent, value: string) => {
      console.log("handleInputChange called", { value })
      debouncedSetMainSearch(value)
    }

    const handleCloseAlert = () => {
      setError(null)
    }

    const mainField = entityName.toLowerCase()
    return (
      <Stack direction="column" spacing={1} sx={{ width: "100%", ...sx }}>
        {error && (
          <Alert severity="error" onClose={handleCloseAlert} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack direction="row" spacing={1} alignItems="center">
          {fields.map(field => {
            if (stableOmit.includes(field.name)) return null
            if (field.name === mainField && MainAutocomplete) {
              return (
                <MainAutocomplete
                  key={keys[field.name]}
                  value={
                    formState.data[field.name] as AutocompleteOption | null
                  }
                  onChange={handleChange(field.name)}
                  onInputChange={handleInputChange}
                  filters={filters}
                  records={filteredMainRecords}
                  sx={{ width: "100%" }}
                  allowNone={field.allowNone}
                />
              )
            }
            const AutocompleteComponent = fieldAutocompletes[field.name]
            if (!AutocompleteComponent) return null
            if (field.type === "search") {
              return (
                <TextField
                  key={keys[field.name]}
                  name={field.name}
                  value={(formState.data[field.name] as string | null) || ""}
                  onChange={e => handleInputChange(e, e.target.value)}
                  placeholder={`${entityName}`}
                  sx={{ width: "100%" }}
                />
              )
            }

            return (
              <AutocompleteComponent
                key={keys[field.name]}
                value={
                  formState.data[field.name] as
                    | AutocompleteOption
                    | string
                    | null
                }
                onChange={handleChange(field.name)}
                filters={filters}
                records={records[field.name] || []}
                sx={{ width: "100%" }}
                allowNone={field.allowNone}
              />
            )
          })}
          {!stableOmit.includes("add") && (
            <AddButton
              onClick={handleAdd}
              disabled={!formState.data[mainField]}
              sx={{ height: "fit-content", alignSelf: "center" }}
            />
          )}
        </Stack>
      </Stack>
    )
  }
}
