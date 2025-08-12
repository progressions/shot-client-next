// components/SiteFilter.tsx
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

const SiteAutocomplete = createAutocomplete("Site")
const FactionAutocomplete = createAutocomplete("Faction")

type SiteFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string>) => void
  omit?: Array<"faction" | "site" | "add">
  excludeIds?: number[]
}

export function SiteFilter({
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: SiteFilterProps) {
  const { client } = useClient()
  const [selectedFaction, setSelectedFaction] =
    useState<AutocompleteOption | null>(null)
  const [selectedSite, setSelectedSite] = useState<AutocompleteOption | null>(
    null
  )
  const [siteRecords, setSiteRecords] = useState<AutocompleteOption[]>([])
  const [factionRecords, setFactionRecords] = useState<AutocompleteOption[]>([])
  const [siteKey, setSiteKey] = useState("site-0")
  const [factionKey, setFactionKey] = useState("faction-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredSiteRecords = siteRecords.filter(
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
        const response = await client.getSites({
          autocomplete: true,
          per_page: 200,
          ...filters,
        })
        const sites = response.data.sites
        const factions = response.data.factions
        setSiteRecords(sites)
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
    if (selectedSite) {
      onChange(selectedSite)
      setSelectedSite(null)
      setSiteKey(`site-${keyCounter}`)
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

  const handleSiteChange = (value: AutocompleteOption | null) => {
    setSelectedSite(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedSite(null)
      setSiteKey(`site-${keyCounter}`)
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
      {!omit.includes("site") && (
        <SiteAutocomplete
          key={siteKey}
          value={selectedSite}
          onChange={handleSiteChange}
          filters={filters}
          records={filteredSiteRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedSite}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}
