// components/JunctureFilter.tsx
"use client"
import { Stack, TextField } from "@mui/material"
import { createAutocomplete, createStringAutocomplete, SearchInput } from "@/components/ui"
import { useState, useCallback } from "react"
import { debounce } from "lodash"
import { FormActions, useForm } from "@/reducers"

interface AutocompleteOption {
  id: number
  name: string
}

type JunctureFilterProps = {
  filters: Record<string, string | boolean>
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"juncture" | "faction" | "search" | "add">
  excludeIds?: number[]
}

const FactionAutocomplete = createAutocomplete("Faction")

export function JunctureFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: JunctureFilterProps) {
  console.log("formState in JunctureFilter", formState)
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
      { !omit.includes("faction") && <FactionAutocomplete
        value={filters?.faction as string}
        onChange={(newValue => changeFilter("faction_id", newValue))}
        records={factions}
        allowNone={true}
        sx={{ width: 200 }}
        placeholder="Faction"
      /> }
      { !omit.includes("search") && <SearchInput
        name="search"
        value={filters?.search as string}
        onFiltersUpdate={(newValue) => changeFilter("search", newValue)}
        placeholder="Juncture"
      /> }
    </Stack>
  )
}
