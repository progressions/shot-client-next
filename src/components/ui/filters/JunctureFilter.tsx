// components/JunctureFilter.tsx
"use client"
import { Stack } from "@mui/material"
import { createAutocomplete, AddButton } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect, useCallback } from "react"
import { debounce } from "lodash"

interface AutocompleteOption {
  id: number
  name: string
}

const JunctureAutocomplete = createAutocomplete("Juncture")
const FactionAutocomplete = createAutocomplete("Faction")

type JunctureFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string>) => void
  omit?: Array<"faction" | "juncture" | "add">
  excludeIds?: number[]
}

export function JunctureFilter({
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: JunctureFilterProps) {
  const { client } = useClient()
  const [selectedFaction, setSelectedFaction] =
    useState<AutocompleteOption | null>(null)
  const [selectedJuncture, setSelectedJuncture] =
    useState<AutocompleteOption | null>(null)
  const [junctureRecords, setJunctureRecords] = useState<AutocompleteOption[]>(
    []
  )
  const [factionRecords, setFactionRecords] = useState<AutocompleteOption[]>([])
  const [junctureKey, setJunctureKey] = useState("juncture-0")
  const [factionKey, setFactionKey] = useState("faction-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredJunctureRecords = junctureRecords.filter(
    record => !excludeIds.includes(record.id)
  )

  const filters = {
    faction_id:
      !omit.includes("faction") && selectedFaction?.id
        ? String(selectedFaction.id)
        : "",
  }

  const fetchRecords = useCallback(
    debounce(async () => {
      try {
        const response = await client.getJunctures({
          autocomplete: true,
          per_page: 200,
          ...filters,
        })
        const junctures = response.data.junctures
        const factions = response.data.factions
        setJunctureRecords(junctures)
        setFactionRecords(factions)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      }
    }, 300),
    [client, selectedFaction, omit]
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
  }, [onFiltersUpdate, selectedFaction, omit])

  const handleAdd = () => {
    if (selectedJuncture) {
      onChange(selectedJuncture)
      setSelectedJuncture(null)
      setJunctureKey(`juncture-${keyCounter}`)
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

  const handleJunctureChange = (value: AutocompleteOption | null) => {
    setSelectedJuncture(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedJuncture(null)
      setJunctureKey(`juncture-${keyCounter}`)
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
      {!omit.includes("juncture") && (
        <JunctureAutocomplete
          key={junctureKey}
          value={selectedJuncture}
          onChange={handleJunctureChange}
          filters={filters}
          records={filteredJunctureRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedJuncture}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}
