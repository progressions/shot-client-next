// components/FightFilter.tsx
"use client"
import { Stack, TextField } from "@mui/material"
import { createStringAutocomplete, SearchInput } from "@/components/ui"
import { useState, useCallback } from "react"
import { debounce } from "lodash"
import { FormActions, useForm } from "@/reducers"

interface AutocompleteOption {
  id: number
  name: string
}

type FormStateData = {
  filters: Record<string, string | boolean>
  fights: AutocompleteOption[]
}

type FightFilterProps = {
  filters: Record<string, string | boolean>
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"season" | "status" | "fight" | "add">
  excludeIds?: number[]
}

const SeasonAutocomplete = createStringAutocomplete("Season")

export function FightFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: FightFilterProps) {
  console.log("Rendering FightFilter with filters:", formState)
  const { filters, seasons } = formState.data
  console.log("filters", filters)

  const changeSeason = (newValue) => {
    console.log("Selected season:", newValue, filters)
    onFiltersUpdate?.({
      ...filters,
      season: newValue || "",
      page: 1, // Reset to first page on filter change
    })
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      { !omit.includes("season") && <SeasonAutocomplete
        value={filters?.season as string}
        onChange={changeSeason}
        filters={{ exclude_ids: excludeIds.join(",") }}
        records={seasons}
        allowNone={true}
        sx={{ width: 200 }}
        placeholder="Season"
      /> }
      { !omit.includes("search") && <SearchInput
        name="search"
        value={filters?.search as string}
        onFiltersUpdate={(newFilters) =>
          onFiltersUpdate?.({
            ...filters,
            ...newFilters,
            page: 1, // Reset to first page on filter change
          })
        }
        placeholder="Fight"
      /> }
    </Stack>
  )
}
