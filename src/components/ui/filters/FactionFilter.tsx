// components/FactionFilter.tsx
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

const FactionAutocomplete = createAutocomplete("Faction")

type FactionFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  omit?: Array<"faction" | "add">
  excludeIds?: number[]
}

export function FactionFilter({
  onChange,
  omit = [],
  excludeIds = [],
}: FactionFilterProps) {
  const { client } = useClient()
  const [selectedFaction, setSelectedFaction] =
    useState<AutocompleteOption | null>(null)
  const [factionRecords, setFactionRecords] = useState<AutocompleteOption[]>([])
  const [factionKey, setFactionKey] = useState("faction-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredFactionRecords = factionRecords.filter(
    record => !excludeIds.includes(record.id)
  )

  const fetchRecords = useCallback(
    debounce(async () => {
      try {
        const response = await client.getFactions({
          autocomplete: true,
          per_page: 200,
        })
        const factions = response.data.factions
        setFactionRecords(factions)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      }
    }, 300),
    [client]
  )

  useEffect(() => {
    fetchRecords()
    return () => {
      fetchRecords.cancel()
    }
  }, [fetchRecords])

  const handleAdd = () => {
    if (selectedFaction) {
      onChange(selectedFaction)
      setSelectedFaction(null)
      setFactionKey(`faction-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  const handleFactionChange = (value: AutocompleteOption | null) => {
    setSelectedFaction(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedFaction(null)
      setFactionKey(`faction-${keyCounter}`)
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
          records={filteredFactionRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedFaction}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}
