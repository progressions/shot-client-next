// components/CharacterFilter.tsx
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

type CharacterFilterProps = {
  filters: Record<string, string | boolean>
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"character" | "add">
  excludeIds?: number[]
}

const TypeAutocomplete = createStringAutocomplete("Type")
const ArchetypeAutocomplete = createStringAutocomplete("Archetype")
const FactionAutocomplete = createAutocomplete("Faction")

export function CharacterFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: CharacterFilterProps) {
    console.log("formState in CharacterFilter", formState)
  const { filters, factions, archetypes } = formState.data

  const changeFilter = (name, newValue) => {
    onFiltersUpdate?.({
      ...filters,
      [name]: newValue?.id || newValue || "",
      page: 1, // Reset to first page on filter change
    })
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      { !omit.includes("type") && <TypeAutocomplete
        value={filters?.character_type as string}
        onChange={(newValue => changeFilter("character_type", newValue))}
        records={["Ally", "PC", "Mook", "Featured Foe", "Boss", "Uber-Boss"]}
        allowNone={true}
        sx={{ width: 200 }}
        placeholder="Type"
      /> }
      { !omit.includes("faction") && <FactionAutocomplete
        value={filters?.faction as string}
        onChange={(newValue => changeFilter("faction_id", newValue))}
        records={factions}
        allowNone={true}
        sx={{ width: 200 }}
        placeholder="Faction"
      /> }
      { !omit.includes("archetype") && <ArchetypeAutocomplete
        value={filters?.archetype as string}
        onChange={(newValue => changeFilter("archetype", newValue))}
        records={archetypes.filter(archetype => archetype)}
        allowNone={true}
        sx={{ width: 200 }}
        placeholder="Archetype"
      /> }
      { !omit.includes("search") && <SearchInput
        name="search"
        value={filters?.search as string}
        onFiltersUpdate={(newValue) => changeFilter("search", newValue)}
        placeholder="Character"
      /> }
    </Stack>
  )
}
