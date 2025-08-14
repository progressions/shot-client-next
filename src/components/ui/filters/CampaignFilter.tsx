// components/CampaignFilter.tsx
"use client"
import { Stack } from "@mui/material"
import { SearchInput } from "@/components/ui"

interface AutocompleteOption {
  id: number
  name: string
}

type CampaignFilterProps = {
  filters: Record<string, string | boolean>
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"campaign" | "search" | "add">
  excludeIds?: number[]
}

export function CampaignFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: CampaignFilterProps) {
  console.log("formState in CampaignFilter", formState)
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
      {!omit.includes("search") && (
        <SearchInput
          name="search"
          value={filters?.search as string}
          onFiltersUpdate={newValue => changeFilter("search", newValue)}
          placeholder="Campaign"
        />
      )}
    </Stack>
  )
}
