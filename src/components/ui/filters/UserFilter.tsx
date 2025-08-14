// components/UserFilter.tsx
"use client"
import { Stack } from "@mui/material"
import { SearchInput } from "@/components/ui"

interface AutocompleteOption {
  id: number
  name: string
}

type UserFilterProps = {
  filters: Record<string, string | boolean>
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"user" | "search" | "add">
  excludeIds?: number[]
}

export function UserFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: UserFilterProps) {
  console.log("formState in UserFilter", formState)
  const { filters } = formState.data

  const changeFilter = (name, newValue) => {
    onFiltersUpdate?.({
      ...filters,
      [name]: newValue?.id || newValue || "",
      page: 1, // Reset to first page on filter change
    })
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {!omit.includes("email") && (
        <SearchInput
          name="email"
          value={filters?.email as string}
          onFiltersUpdate={newValue => changeFilter("email", newValue)}
          placeholder="Email"
        />
      )}
      {!omit.includes("search") && (
        <SearchInput
          name="search"
          value={filters?.search as string}
          onFiltersUpdate={newValue => changeFilter("search", newValue)}
          placeholder="User"
        />
      )}
    </Stack>
  )
}
