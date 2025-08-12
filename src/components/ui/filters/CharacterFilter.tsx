// components/CharacterFilter.tsx
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

const CharacterAutocomplete = createAutocomplete("Character")
const FactionAutocomplete = createAutocomplete("Faction")
const TypeAutocomplete = createStringAutocomplete("Type")
const ArchetypeAutocomplete = createStringAutocomplete("Archetype")

type CharacterFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string>) => void
  omit?: Array<"type" | "faction" | "character" | "archetype" | "add">
  excludeIds?: number[]
}

export function CharacterFilter({
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: CharacterFilterProps) {
  const { client } = useClient()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedFaction, setSelectedFaction] =
    useState<AutocompleteOption | null>(null)
  const [selectedCharacter, setSelectedCharacter] =
    useState<AutocompleteOption | null>(null)
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(
    null
  )
  const [characterRecords, setCharacterRecords] = useState<
    AutocompleteOption[]
  >([])
  const [factionRecords, setFactionRecords] = useState<AutocompleteOption[]>([])
  const [archetypeRecords, setArchetypeRecords] = useState<string[]>([])
  const [typeRecords] = useState<string[]>([
    "Ally",
    "PC",
    "Mook",
    "Featured Foe",
    "Boss",
    "Uber-Boss",
  ])
  const [characterKey, setCharacterKey] = useState("character-0")
  const [factionKey, setFactionKey] = useState("faction-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredCharacterRecords = characterRecords.filter(
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
        const response = await client.getCharacters({
          autocomplete: true,
          per_page: 200,
          ...filters,
        })
        const characters = response.data.characters
        const factions = response.data.factions
        const archetypes = response.data.archetypes.filter(
          (archetype: string | null) => archetype && archetype.trim() !== ""
        )
        setCharacterRecords(characters)
        setFactionRecords(factions)
        setArchetypeRecords(archetypes)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      }
    }, 300),
    [client, selectedFaction, selectedType, selectedArchetype, omit]
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
  }, [onFiltersUpdate, selectedFaction, selectedType, selectedArchetype, omit])

  const handleAdd = () => {
    if (selectedCharacter) {
      onChange(selectedCharacter)
      setSelectedCharacter(null)
      setCharacterKey(`character-${keyCounter}`)
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

  const handleCharacterChange = (value: AutocompleteOption | null) => {
    setSelectedCharacter(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedCharacter(null)
      setCharacterKey(`character-${keyCounter}`)
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
      {!omit.includes("archetype") && (
        <ArchetypeAutocomplete
          value={selectedArchetype}
          onChange={setSelectedArchetype}
          filters={{}}
          records={archetypeRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("character") && (
        <CharacterAutocomplete
          key={characterKey}
          value={selectedCharacter}
          onChange={handleCharacterChange}
          filters={filters}
          records={filteredCharacterRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedCharacter}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}
