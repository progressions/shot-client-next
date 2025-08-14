// components/WeaponFilter.tsx
"use client"
import { Stack } from "@mui/material"
import { createStringAutocomplete, SearchInput } from "@/components/ui"

interface AutocompleteOption {
  id: number
  name: string
}

type WeaponFilterProps = {
  filters: Record<string, string | boolean>
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"weapon" | "add">
  excludeIds?: number[]
}

const JunctureAutocomplete = createStringAutocomplete("Juncture")
const CategoryAutocomplete = createStringAutocomplete("Category")

export function WeaponFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: WeaponFilterProps) {
  console.log("formState in WeaponFilter", formState)
  const { filters, categories, junctures } = formState.data

  const changeFilter = (name, newValue) => {
    onFiltersUpdate?.({
      ...filters,
      [name]: newValue?.id || newValue || "",
      page: 1, // Reset to first page on filter change
    })
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {!omit.includes("juncture") && (
        <JunctureAutocomplete
          value={filters?.juncture as string}
          onChange={newValue => changeFilter("juncture", newValue)}
          records={junctures}
          allowNone={true}
          sx={{ width: 200 }}
        />
      )}
      {!omit.includes("category") && (
        <CategoryAutocomplete
          value={filters?.category as string}
          onChange={newValue => changeFilter("category", newValue)}
          records={categories}
          allowNone={true}
          sx={{ width: 200 }}
        />
      )}
      {!omit.includes("search") && (
        <SearchInput
          name="search"
          value={filters?.search as string}
          onFiltersUpdate={newValue => changeFilter("search", newValue)}
          placeholder="Weapon"
        />
      )}
    </Stack>
  )
}
