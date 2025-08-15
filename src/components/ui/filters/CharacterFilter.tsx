"use client"
import { Stack } from "@mui/material"
import {
  AddButton,
  createAutocomplete,
  createStringAutocomplete,
  SearchInput,
} from "@/components/ui"
import { useCallback } from "react"

interface AutocompleteOption {
  id: number
  name: string
}

type CharacterFilterProps = {
  formState: {
    data: {
      filters: Record<string, string | boolean | null>
      characters: AutocompleteOption[]
      factions: AutocompleteOption[]
      archetypes: string[]
    }
  }
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean | null>) => void
  omit?: Array<
    "character" | "type" | "archetype" | "faction" | "search" | "add"
  >
  excludeIds?: number[]
}

const TypeAutocomplete = createStringAutocomplete("Type")
const ArchetypeAutocomplete = createStringAutocomplete("Archetype")
const FactionAutocomplete = createAutocomplete("Faction")
const CharacterAutocomplete = createAutocomplete("Character")

export function CharacterFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: CharacterFilterProps) {
  console.log("formState in CharacterFilter", formState)
  const { filters, characters, factions, archetypes } = formState.data

  const changeFilter = (
    name: string,
    newValue: AutocompleteOption | string | null
  ) => {
    onFiltersUpdate?.({
      ...filters,
      [name]:
        newValue && typeof newValue === "object" ? newValue.id : newValue || "",
      page: 1, // Reset to first page on filter change
    })
  }

  const handleAdd = useCallback(() => {
    console.log("character_id", filters?.character_id)
    const character = characters.find(c => c.id === filters?.character_id)
    console.log("character", character)
    onChange(character || null)
    onFiltersUpdate?.({
      ...filters,
      character_id: null,
      character: null, // Ensure this matches the value prop of CharacterAutocomplete
    })
  }, [filters, characters, onChange, onFiltersUpdate])

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {!omit.includes("type") && (
        <TypeAutocomplete
          value={filters?.character_type as string}
          onChange={newValue => changeFilter("character_type", newValue)}
          records={["Ally", "PC", "Mook", "Featured Foe", "Boss", "Uber-Boss"]}
          allowNone={true}
          sx={{ width: 200 }}
          placeholder="Type"
        />
      )}
      {!omit.includes("faction") && (
        <FactionAutocomplete
          value={filters?.faction}
          onChange={newValue => changeFilter("faction_id", newValue)}
          records={factions}
          allowNone={true}
          sx={{ width: 200 }}
          placeholder="Faction"
        />
      )}
      {!omit.includes("archetype") && (
        <ArchetypeAutocomplete
          value={filters?.archetype as string}
          onChange={newValue => changeFilter("archetype", newValue)}
          records={archetypes.filter(archetype => archetype)}
          allowNone={true}
          sx={{ width: 200 }}
          placeholder="Archetype"
        />
      )}
      {!omit.includes("character") && (
        <CharacterAutocomplete
          value={filters?.character as AutocompleteOption | null}
          onChange={newValue => changeFilter("character_id", newValue)}
          records={characters}
          allowNone={true}
          sx={{ width: 200 }}
          placeholder="Character"
        />
      )}
      {!omit.includes("search") && (
        <SearchInput
          name="search"
          value={filters?.search as string}
          onFiltersUpdate={newValue => changeFilter("search", newValue)}
          placeholder="Character"
        />
      )}
      {!omit.includes("add") && (
        <AddButton onClick={handleAdd} disabled={!filters?.character_id} />
      )}
    </Stack>
  )
}
