// components/FightFilter.tsx
"use client"
import { Stack, TextField } from "@mui/material"
import { SearchInput } from "@/components/ui"
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

export function FightFilter({
  filters,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: FightFilterProps) {

    console.log("filters", filters?.search)

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <SearchInput
        name="search"
        value={filters?.search as string}
        onFiltersUpdate={onFiltersUpdate}
        placeholder="Fight"
      />
    </Stack>
  )
}
