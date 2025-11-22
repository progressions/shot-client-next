"use client"

import { Box } from "@mui/material"
import { FormActions, useForm } from "@/reducers"
import { useClient } from "@/contexts"
import { GenericFilter } from "@/components/ui/filters/GenericFilter"
import type { Character, Faction } from "@/types"
import { useCallback, useEffect } from "react"

type FormStateData = {
  filters: Record<string, string | boolean | null | Faction | Character>
  characters: Character[]
  factions: Faction[]
  archetypes: string[]
  selectedChild: Character | null
}

type OmitType =
  | "character_type"
  | "archetype"
  | "faction"
  | "character"
  | "add"
  | "search"

type CharacterFilterProps = {
  // value is the ID of the selected character
  value?: string | null
  setSelectedChild: (character: Character | null) => void
  addMember?: (character: Character) => void
  dispatch?: React.Dispatch<FormStateData>
  omit: OmitType[]
}

export default function CharacterFilter({
  value: _value,
  setSelectedChild,
  addMember,
  dispatch: _dispatch,
  omit = [],
}: CharacterFilterProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    filters: {
      character_type: null,
      archetype: null,
      faction_id: null,
      faction: null,
      character_id: null,
      character: null,
      search: "",
    },
    characters: [],
    factions: [],
    archetypes: [],
    selectedChild: null,
  })

  // Extract filter values to stable references
  const factionId = formState.data.filters.faction_id as string
  const characterType = formState.data.filters.character_type as string
  const archetype = formState.data.filters.archetype as string
  const search = formState.data.filters.search as string

  const fetchCharacters = useCallback(async () => {
    try {
      const response = await client.getCharacters({
        autocomplete: true,
        faction_id: factionId,
        character_type: characterType,
        archetype: archetype,
        search: search,
        per_page: 100,
        sort: "name",
        order: "asc",
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "characters",
        value: response.data.characters || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "archetypes",
        value: response.data.archetypes || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "factions",
        value: response.data.factions || [],
      })
    } catch (error) {
      console.error("Error fetching characters:", error)
      return []
    }
  }, [client, factionId, characterType, archetype, search, dispatchForm])

  useEffect(() => {
    fetchCharacters().catch(error => {
      console.error("Error in useEffect fetchCharacters:", error)
    })
  }, [fetchCharacters])

  const handleCharacterChange = (character: Character | null) => {
    console.log(
      "[CharacterFilter] handleCharacterChange called with:",
      character
    )

    if (character && addMember) {
      addMember(character)
      // Clear the selection after adding
      dispatchForm({
        type: FormActions.UPDATE,
        name: "filters",
        value: {
          ...formState.data.filters,
          character_id: null,
          character: null,
        },
      })
    }
    setSelectedChild?.(character)
  }

  const handleFiltersUpdate = (
    filters: Record<string, string | boolean | null>
  ) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "filters",
      value: filters,
    })
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <GenericFilter
        entity="Character"
        formState={formState}
        onChange={handleCharacterChange}
        onFiltersUpdate={handleFiltersUpdate}
        omit={omit}
      />
    </Box>
  )
}
