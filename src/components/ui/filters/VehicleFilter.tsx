// components/VehicleFilter.tsx
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

type VehicleFilterProps = {
  filters: Record<string, string | boolean>
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"vehicle" | "type" | "archetype" | "faction" | "search" | "add">
  excludeIds?: number[]
}

const TypeAutocomplete = createStringAutocomplete("Type")
const ArchetypeAutocomplete = createStringAutocomplete("Archetype")
const FactionAutocomplete = createAutocomplete("Faction")
const VehicleAutocomplete = createAutocomplete("Vehicle")

export function VehicleFilter({
  formState,
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: VehicleFilterProps) {
  console.log("formState in VehicleFilter", formState)
  const { filters, vehicles, factions, archetypes } = formState.data

  const changeFilter = (name, newValue) => {
    onFiltersUpdate?.({
      ...filters,
      [name]: newValue?.id || newValue || "",
      page: 1, // Reset to first page on filter change
    })
  }

  const handleAdd = useCallback(() => {
    console.log("vehicle_id", filters?.vehicle_id)
    const vehicle = vehicles.find(c => c.id === filters?.vehicle_id)
    console.log("vehicle", vehicle)
    onChange(vehicle)
    onFiltersUpdate?.({
      ...filters,
      vehicle_id: null,
      vehicle: null,
    })
  }, [filters?.vehicle_id])

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {!omit.includes("type") && (
        <TypeAutocomplete
          value={filters?.vehicle_type as string}
          onChange={newValue => changeFilter("vehicle_type", newValue)}
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
      {!omit.includes("vehicle") && (
        <VehicleAutocomplete
          value={
            filters?.vehicle || ({ id: null, name: "" } as AutocompleteOption)
          }
          onChange={newValue => changeFilter("vehicle_id", newValue)}
          records={vehicles}
          allowNone={true}
          sx={{ width: 200 }}
          placeholder="Vehicle"
        />
      )}
      {!omit.includes("search") && (
        <SearchInput
          name="search"
          value={filters?.search as string}
          onFiltersUpdate={newValue => changeFilter("search", newValue)}
          placeholder="Vehicle"
        />
      )}
      {!omit.includes("add") && (
        <AddButton onClick={handleAdd} disabled={!filters?.vehicle_id} />
      )}
    </Stack>
  )
}
