// components/FightFilter.tsx
"use client"
import { Stack, Autocomplete, TextField } from "@mui/material"
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

const FightAutocomplete = createAutocomplete("Fight")
const SeasonAutocomplete = createStringAutocomplete("Season")

type FightFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean>) => void
  omit?: Array<"season" | "status" | "fight" | "add">
  excludeIds?: number[]
}

export function FightFilter({
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: FightFilterProps) {
  const { client } = useClient()
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedFight, setSelectedFight] = useState<AutocompleteOption | null>(
    null
  )
  const [fightRecords, setFightRecords] = useState<AutocompleteOption[]>([])
  const [seasonRecords, setSeasonRecords] = useState<string[]>([])
  const [statusRecords] = useState<string[]>(["Started", "Unstarted"])
  const [fightKey, setFightKey] = useState("fight-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredFightRecords = fightRecords.filter(
    record => !excludeIds.includes(record.id)
  )

  const filters = {
    season: !omit.includes("season") && selectedSeason ? selectedSeason : "",
    unstarted:
      !omit.includes("status") && selectedStatus === "Unstarted"
        ? true
        : undefined,
    unended:
      !omit.includes("status") && selectedStatus === "Started"
        ? true
        : undefined,
  }

  const fetchRecords = useCallback(
    debounce(async () => {
      try {
        const response = await client.getFights({
          autocomplete: true,
          per_page: 200,
          ...filters,
        })
        const fights = response.data.fights
        const seasons = response.data.seasons
          .filter(
            (season: number | null) => season !== null && season !== undefined
          )
          .map((season: number) => String(season))
        setFightRecords(fights)
        setSeasonRecords(seasons)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      }
    }, 300),
    [client, selectedSeason, selectedStatus, omit]
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
  }, [onFiltersUpdate, selectedSeason, selectedStatus, omit])

  const handleAdd = () => {
    if (selectedFight) {
      onChange(selectedFight)
      setSelectedFight(null)
      setFightKey(`fight-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  const handleFightChange = (value: AutocompleteOption | null) => {
    setSelectedFight(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedFight(null)
      setFightKey(`fight-${keyCounter}`)
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
      {!omit.includes("season") && (
        <SeasonAutocomplete
          value={selectedSeason}
          onChange={setSelectedSeason}
          filters={{}}
          records={seasonRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("status") && (
        <Autocomplete
          options={statusRecords}
          getOptionLabel={option => option}
          value={selectedStatus}
          onChange={(event, newValue) => setSelectedStatus(newValue)}
          sx={{ width: "100%" }}
          renderInput={params => (
            <TextField {...params} label="Select Status" variant="outlined" />
          )}
        />
      )}
      {!omit.includes("fight") && (
        <FightAutocomplete
          key={fightKey}
          value={selectedFight}
          onChange={handleFightChange}
          filters={filters}
          records={filteredFightRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedFight}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}
