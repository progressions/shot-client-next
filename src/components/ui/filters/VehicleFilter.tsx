// components/VehicleFilter.tsx
"use client"
import { Stack } from "@mui/material"
import {
  createAutocomplete,
  createStringAutocomplete,
  AddButton,
} from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect, useCallback } from "react"
import { debounce } from "lodash"

interface AutocompleteOption {
  id: number
  name: string
}

const VehicleAutocomplete = createAutocomplete("Vehicle")
const FactionAutocomplete = createAutocomplete("Faction")
const TypeAutocomplete = createStringAutocomplete("Type")
const ArchetypeAutocomplete = createStringAutocomplete("Archetype")

type VehicleFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string>) => void
  omit?: Array<"type" | "archetype" | "faction" | "vehicle" | "add">
  excludeIds?: number[]
}

export function VehicleFilter({
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: VehicleFilterProps) {
  const { client } = useClient()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(
    null
  )
  const [selectedFaction, setSelectedFaction] =
    useState<AutocompleteOption | null>(null)
  const [selectedVehicle, setSelectedVehicle] =
    useState<AutocompleteOption | null>(null)
  const [vehicleRecords, setVehicleRecords] = useState<AutocompleteOption[]>([])
  const [factionRecords, setFactionRecords] = useState<AutocompleteOption[]>([])
  const [typeRecords, setTypeRecords] = useState<string[]>([])
  const [archetypeRecords, setArchetypeRecords] = useState<string[]>([])
  const [vehicleKey, setVehicleKey] = useState("vehicle-0")
  const [factionKey, setFactionKey] = useState("faction-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredVehicleRecords = vehicleRecords.filter(
    record => !excludeIds.includes(record.id)
  )

  const filters = {
    faction_id:
      !omit.includes("faction") && selectedFaction?.id
        ? String(selectedFaction.id)
        : "",
    type: !omit.includes("type") && selectedType ? selectedType : "",
    archetype:
      !omit.includes("archetype") && selectedArchetype ? selectedArchetype : "",
  }

  const fetchRecords = useCallback(
    debounce(async () => {
      try {
        const response = await client.getVehicles({
          autocomplete: true,
          per_page: 200,
          ...filters,
        })
        const vehicles = response.data.vehicles
        const factions = response.data.factions
        const types = response.data.types.filter(
          (type: string | null) => type && type.trim() !== ""
        )
        const archetypes = response.data.archetypes.filter(
          (archetype: string | null) => archetype && archetype.trim() !== ""
        )
        setVehicleRecords(vehicles)
        setFactionRecords(factions)
        setTypeRecords(types)
        setArchetypeRecords(archetypes)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      }
    }, 300),
    [client, selectedType, selectedArchetype, selectedFaction, omit]
  )

  useEffect(() => {
    fetchRecords()
    return () => {
      fetchRecords.cancel()
    }
  }, [fetchRecords])

  useEffect(() => {
    if (onFiltersUpdate) {
      onFiltersUpdate(filters)
    }
  }, [onFiltersUpdate, selectedType, selectedArchetype, selectedFaction, omit])

  const handleAdd = () => {
    if (selectedVehicle) {
      onChange(selectedVehicle)
      setSelectedVehicle(null)
      setVehicleKey(`vehicle-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  const handleFactionChange = (value: AutocompleteOption | null) => {
    setSelectedFaction(value)
    if (!value) {
      setFactionKey(`faction-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  const handleVehicleChange = (value: AutocompleteOption | null) => {
    setSelectedVehicle(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedVehicle(null)
      setVehicleKey(`vehicle-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ width: "100%" }}
    >
      {!omit.includes("type") && (
        <TypeAutocomplete
          value={selectedType}
          onChange={setSelectedType}
          filters={{}}
          records={typeRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("archetype") && (
        <ArchetypeAutocomplete
          value={selectedArchetype}
          onChange={setSelectedArchetype}
          filters={{}}
          records={archetypeRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("faction") && (
        <FactionAutocomplete
          key={factionKey}
          value={selectedFaction}
          onChange={handleFactionChange}
          filters={{}}
          records={factionRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("vehicle") && (
        <VehicleAutocomplete
          key={vehicleKey}
          value={selectedVehicle}
          onChange={handleVehicleChange}
          filters={filters}
          records={filteredVehicleRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedVehicle}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}
