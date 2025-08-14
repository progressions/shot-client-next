// components/PartyFilter.tsx
"use client"
import { Stack } from "@mui/material"
import { createAutocomplete, SearchInput } from "@/components/ui"

interface AutocompleteOption {
  id: number
  name: string
}

type PartyFilterProps = {
  filters: Record<string, string | boolean>
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"party" | "faction" | "search" | "add">
  excludeIds?: number[]
}

const FactionAutocomplete = createAutocomplete("Faction")

export function PartyFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: PartyFilterProps) {
  console.log("formState in PartyFilter", formState)
  const { filters, factions } = formState.data

  const changeFilter = (name, newValue) => {
    onFiltersUpdate?.({
      ...filters,
      [name]: newValue?.id || newValue || "",
      page: 1, // Reset to first page on filter change
    })
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {!omit.includes("faction") && (
        <FactionAutocomplete
          value={filters?.faction as string}
          onChange={newValue => changeFilter("faction_id", newValue)}
          records={factions}
          allowNone={true}
          sx={{ width: 200 }}
          placeholder="Faction"
        />
      )}
      {!omit.includes("search") && (
        <SearchInput
          name="search"
          value={filters?.search as string}
          onFiltersUpdate={newValue => changeFilter("search", newValue)}
          placeholder="Party"
        />
      )}
    </Stack>
  )
}
