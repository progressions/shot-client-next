"use client"
import { Stack } from "@mui/material"
import { AddButton } from "../AddButton"
import { ModelAutocomplete } from "../ModelAutocomplete"
import { StringAutocomplete } from "../StringAutocomplete"
import { SearchInput } from "../SearchInput"
import { useCallback, useEffect, useMemo } from "react"
import { filterConfigs } from "@/lib/filterConfigs"
import { debounce } from "lodash"

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
  excludeIds: _excludeIds = [],
}: GenericFilterProps) {
  const config = filterConfigs[entity]
  const { filters, ...data } = formState.data
  const primaryField = config.fields.find(
    f => f.name.toLowerCase() === entity.toLowerCase()
  )

  const primaryFieldId = primaryField ? `${primaryField.name}_id` : null

  const debouncedSearchUpdate = useMemo(() => {
    if (!onFiltersUpdate || !primaryField || primaryField.type !== "entity") {
      return null
    }

    return debounce(
      (
        value: string,
        currentFilters: Record<string, string | boolean | null>
      ) => {
        onFiltersUpdate({
          ...currentFilters,
          ...(primaryFieldId
            ? { [primaryFieldId]: null, [primaryField.name]: null }
            : {}),
          search: value,
          page: 1,
        })
      },
      300
    )
  }, [onFiltersUpdate, primaryField, primaryFieldId])

  useEffect(() => {
    return () => {
      debouncedSearchUpdate?.cancel()
    }
  }, [debouncedSearchUpdate])

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
  }, [filters, data, entity, onChange, onFiltersUpdate, primaryField, config])

  const renderField = (field: FilterFieldConfig) => {
    if (omit.includes(field.name)) return null

    const displayName =
      field.displayName ||
      field.name.charAt(0).toUpperCase() + field.name.slice(1)

    if (field.type === "static") {
      return (
        <StringAutocomplete
          key={field.name}
          model={displayName}
          value={filters?.[field.name] as string}
          onChange={newValue => changeFilter(field.name, newValue)}
          records={field.staticOptions || []}
          allowNone={field.allowNone ?? true}
          sx={{ width: 200 }}
        />
      )
    }

    if (field.type === "string") {
      return (
        <StringAutocomplete
          key={field.name}
          model={displayName}
          value={filters?.[field.name] as string}
          onChange={newValue => changeFilter(field.name, newValue)}
          records={
            data[config.responseKeys[field.name]]?.filter(
              (item: string) => item
            ) || []
          }
          allowNone={field.allowNone ?? true}
          sx={{ width: 200 }}
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
        const userOptions = records.map(
          (user: { id: string; name?: string; email?: string }) => ({
            id: user.id,
            name:
              user.name && user.email
                ? `${user.name} (${user.email})`
                : user.name || user.email || "Unknown User",
          })
        )

        return (
          <ModelAutocomplete
            key={field.name}
            model={entityName}
            value={filters?.[field.name] as AutocompleteOption | null}
            onChange={newValue =>
              changeFilter(field.name + "_id", newValue, true)
            }
            filters={{}}
            records={userOptions}
            allowNone={field.allowNone ?? true}
            sx={{ width: 300 }}
          />
        )
      }

      return (
        <ModelAutocomplete
          key={field.name}
          model={entityName}
          value={filters?.[field.name + "_id"] as string | null}
          onChange={newValue =>
            changeFilter(field.name + "_id", newValue, true)
          }
          onInputChange={
            debouncedSearchUpdate && field.name === primaryField.name
              ? (_event, newValue) =>
                  debouncedSearchUpdate(newValue ?? "", filters)
              : undefined
          }
          filters={{}}
          records={data[responseKey] || []}
          allowNone={field.allowNone ?? true}
          sx={{ width: 200 }}
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
