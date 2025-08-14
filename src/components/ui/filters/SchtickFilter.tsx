// components/SchtickFilter.tsx
"use client"
import { Stack } from "@mui/material"
import { createStringAutocomplete, SearchInput } from "@/components/ui"

interface AutocompleteOption {
  id: number
  name: string
}

type SchtickFilterProps = {
  filters: Record<string, string | boolean>
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"schtick" | "add">
  excludeIds?: number[]
}

const CategoryAutocomplete = createStringAutocomplete("Category")
const PathAutocomplete = createStringAutocomplete("Path")

export function SchtickFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: SchtickFilterProps) {
  console.log("formState in SchtickFilter", formState)
  const { filters, categories, paths } = formState.data

  const changeFilter = (name, newValue) => {
    console.log("wut", newValue)
    onFiltersUpdate?.({
      ...filters,
      [name]: newValue?.id || newValue || "",
      page: 1, // Reset to first page on filter change
    })
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {!omit.includes("category") && (
        <CategoryAutocomplete
          value={filters?.category as string}
          onChange={newValue => changeFilter("category", newValue)}
          records={categories}
          allowNone={true}
          sx={{ width: 200 }}
          placeholder="Category"
        />
      )}
      {!omit.includes("path") && (
        <PathAutocomplete
          value={filters?.path as string}
          onChange={newValue => changeFilter("path", newValue)}
          records={paths.filter(path => path)}
          allowNone={true}
          sx={{ width: 200 }}
          placeholder="Path"
        />
      )}
      {!omit.includes("search") && (
        <SearchInput
          name="search"
          value={filters?.search as string}
          onFiltersUpdate={newValue => changeFilter("search", newValue)}
          placeholder="Schtick"
        />
      )}
    </Stack>
  )
}
