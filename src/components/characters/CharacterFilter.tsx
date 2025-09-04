"use client"

import { Box } from "@mui/material"
import { FormActions, useForm } from "@/reducers"
import { useClient } from "@/contexts"
import { GenericFilter } from "@/components/ui/filters/GenericFilter"
import type { Character, Faction } from "@/types"
import { useCallback, useEffect } from "react"

type FormStateData = {
  filters: Record<string, string | boolean | null>
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
      character_id: null,
      search: "",
    },
    characters: [],
    factions: [],
    archetypes: [],
    selectedChild: null,
  })

  const fetchCharacters = useCallback(async () => {
    try {
      const { filters } = formState.data
      const response = await client.getCharacters({
        autocomplete: true,
        faction_id: filters.faction_id as string,
        character_type: filters.character_type as string,
        archetype: filters.archetype as string,
        search: filters.search as string,
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
  }, [client, formState.data.filters, formState.data, dispatchForm]) // Only depend on filters

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
