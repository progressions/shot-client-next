// components/PartyFilter.tsx
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

const PartyAutocomplete = createAutocomplete("Party")
const FactionAutocomplete = createAutocomplete("Faction")

type PartyFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string>) => void
  omit?: Array<"faction" | "party" | "add">
  excludeIds?: number[]
}

export function PartyFilter({
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: PartyFilterProps) {
  const { client } = useClient()
  const [selectedFaction, setSelectedFaction] =
    useState<AutocompleteOption | null>(null)
  const [selectedParty, setSelectedParty] = useState<AutocompleteOption | null>(
    null
  )
  const [partyRecords, setPartyRecords] = useState<AutocompleteOption[]>([])
  const [factionRecords, setFactionRecords] = useState<AutocompleteOption[]>([])
  const [partyKey, setPartyKey] = useState("party-0")
  const [factionKey, setFactionKey] = useState("faction-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredPartyRecords = partyRecords.filter(
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
        const response = await client.getParties({
          autocomplete: true,
          per_page: 200,
          ...filters,
        })
        const parties = response.data.parties
        const factions = response.data.factions
        setPartyRecords(parties)
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
    if (selectedParty) {
      onChange(selectedParty)
      setSelectedParty(null)
      setPartyKey(`party-${keyCounter}`)
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

  const handlePartyChange = (value: AutocompleteOption | null) => {
    setSelectedParty(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedParty(null)
      setPartyKey(`party-${keyCounter}`)
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
      {!omit.includes("party") && (
        <PartyAutocomplete
          key={partyKey}
          value={selectedParty}
          onChange={handlePartyChange}
          filters={filters}
          records={filteredPartyRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedParty}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}
