"use client"
import { Stack } from "@mui/material"
import {
  AddButton,
  createAutocomplete,
  createStringAutocomplete,
  SearchInput,
} from "@/components/ui"
import { useCallback } from "react"
import { filterConfigs } from "@/lib/filterConfigs"

interface AutocompleteOption {
  id: number
  name: string
}

interface FilterFieldConfig {
  name: string
  type: "entity" | "string" | "static" | "search"
  staticOptions?: string[]
  allowNone?: boolean
  responseKey?: string
  displayName?: string
}

interface GenericFilterProps {
  entity: keyof typeof filterConfigs
  formState: {
    data: {
      filters: Record<string, string | boolean | null>
      [key: string]: unknown
    }
  }
  onChange?: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean | null>) => void
  omit?: string[]
  excludeIds?: number[]
}

export function GenericFilter({
  entity,
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: GenericFilterProps) {
  const config = filterConfigs[entity]
  const { filters, ...data } = formState.data

  const changeFilter = (
    name: string,
    newValue: AutocompleteOption | string | null,
    isEntity: boolean = false
  ) => {
    const updatedFilters = {
      ...filters,
      page: 1,
    }
    if (isEntity) {
      updatedFilters[name] = newValue ? newValue.id : ""
      updatedFilters[name.replace("_id", "")] = newValue
    } else {
      updatedFilters[name] =
        newValue && typeof newValue === "object" ? newValue.id : newValue || ""
    }
    onFiltersUpdate?.(updatedFilters)
  }

  const handleAdd = useCallback(() => {
    const primaryField = config.fields.find(
      f => f.name.toLowerCase() === entity.toLowerCase()
    )
    if (!primaryField || primaryField.type !== "entity") {
      console.error(
        `handleAdd: Invalid primary field for entity=${entity}`,
        primaryField
      )
      return
    }
    const primaryFieldId = `${primaryField.name}_id`
    if (!filters?.[primaryFieldId]) {
      return
    }
    const responseKey = config.responseKeys[primaryField.name]
    const records = data[responseKey] || []
    const selected = records.find(
      (r: AutocompleteOption) => r.id === filters[primaryFieldId]
    )
    if (!selected) {
      console.error(
        `handleAdd: No item found for id=${filters[primaryFieldId]} in data.${responseKey}`
      )
    }
    onChange?.(selected || null)
    onFiltersUpdate?.({
      ...filters,
      [primaryFieldId]: null,
      [primaryField.name]: null,
    })
  }, [filters, data, config, entity, onChange, onFiltersUpdate])

  const renderField = (field: FilterFieldConfig) => {
    if (omit.includes(field.name)) return null

    const displayName =
      field.displayName ||
      field.name.charAt(0).toUpperCase() + field.name.slice(1)
    const isPrimaryField = field.name.toLowerCase() === entity.toLowerCase()

    if (field.type === "static") {
      const Autocomplete = createStringAutocomplete(displayName)
      return (
        <Autocomplete
          key={field.name}
          value={filters?.[field.name] as string}
          onChange={newValue => changeFilter(field.name, newValue)}
          records={field.staticOptions || []}
          allowNone={field.allowNone ?? true}
          sx={{ width: 200 }}
          placeholder={displayName}
        />
      )
    }

    if (field.type === "string") {
      const Autocomplete = createStringAutocomplete(displayName)
      return (
        <Autocomplete
          key={field.name}
          value={filters?.[field.name] as string}
          onChange={newValue => changeFilter(field.name, newValue)}
          records={
            data[config.responseKeys[field.name]]?.filter(
              (item: string) => item
            ) || []
          }
          allowNone={field.allowNone ?? true}
          sx={{ width: 200 }}
          placeholder={displayName}
        />
      )
    }

    if (field.type === "entity") {
      const responseKey = config.responseKeys[field.name]
      const entityName =
        responseKey.charAt(0).toUpperCase() + responseKey.slice(1)
      
      // Special handling for Users to show email addresses
      if (responseKey === "users") {
        const records = data[responseKey] || []
        const userOptions = records.map((user: any) => ({
          id: user.id,
          name: user.name && user.email
            ? `${user.name} (${user.email})`
            : user.name || user.email || "Unknown User"
        }))
        
        const Autocomplete = createAutocomplete(entityName)
        return (
          <Autocomplete
            key={field.name}
            value={filters?.[field.name] as AutocompleteOption | null}
            onChange={newValue =>
              changeFilter(field.name + "_id", newValue, true)
            }
            records={userOptions}
            allowNone={field.allowNone ?? true}
            sx={{ width: 300 }}
            placeholder={displayName}
            excludeIds={isPrimaryField ? excludeIds : undefined}
          />
        )
      }
      
      const Autocomplete = createAutocomplete(entityName)
      return (
        <Autocomplete
          key={field.name}
          value={filters?.[field.name] as AutocompleteOption | null}
          onChange={newValue =>
            changeFilter(field.name + "_id", newValue, true)
          }
          records={data[responseKey] || []}
          allowNone={field.allowNone ?? true}
          sx={{ width: 200 }}
          placeholder={displayName}
          excludeIds={isPrimaryField ? excludeIds : undefined}
        />
      )
    }

    if (field.type === "search") {
      return (
        <SearchInput
          key={field.name}
          name={field.name}
          value={filters?.[field.name] as string}
          onFiltersUpdate={newValue => changeFilter(field.name, newValue)}
          placeholder={displayName}
        />
      )
    }

    return null
  }

  const primaryField = config.fields.find(
    f => f.name.toLowerCase() === entity.toLowerCase()
  )
  const primaryFieldId = primaryField ? `${primaryField.name}_id` : null

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {config.fields.map(field => renderField(field))}
      {!omit.includes("add") &&
        primaryField &&
        primaryField.type === "entity" && (
          <AddButton
            onClick={handleAdd}
            disabled={!filters?.[primaryFieldId]}
          />
        )}
    </Stack>
  )
}
