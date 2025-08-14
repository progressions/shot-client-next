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
  const { filters, seasons } = formState.data

  const changeFilter = (name, newValue) => {
    onFiltersUpdate?.({
      ...filters,
      [name]: newValue || "",
      page: 1, // Reset to first page on filter change
    })
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      { !omit.includes("season") && <SeasonAutocomplete
        value={filters?.season as string}
        onChange={(newValue => changeFilter("season", newValue))}
        filters={{ exclude_ids: excludeIds.join(",") }}
        records={seasons}
        allowNone={true}
        sx={{ width: 200 }}
        placeholder="Season"
      /> }
      { !omit.includes("search") && <SearchInput
        name="search"
        value={filters?.search as string}
        onFiltersUpdate={(newValue) => changeFilter("search", newValue)}
        placeholder="Fight"
      /> }
    </Stack>
  )
}
