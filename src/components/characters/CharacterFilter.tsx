"use client"

import { Stack, Box } from "@mui/material"
import { FormActions, useForm } from "@/reducers"
import { useClient } from "@/contexts"
import {
  FactionAutocomplete,
  CharacterAutocomplete,
} from "@/components/autocomplete"
import { AddButton, Autocomplete } from "@/components/ui"
import type { Character, Faction } from "@/types"
import { useCallback, useEffect } from "react"

type FormStateData = {
  character_type: string | null
  archetypes: string[]
  archetype: string | null
  characters: Character[]
  factions: Faction[]
  faction_id: string | null
  selectedChild: Character | null
}

type OmitType = "type" | "archetype" | "faction" | "character"

type CharacterFilterProps = {
  // value is the ID of the selected character
  value?: string | null
  setSelectedChild: (character: Character) => void
  addMember?: (character: Character) => void
  dispatch: React.Dispatch<FormStateData>
  omit: OmitType[]
}

export default function CharacterFilter({
  value,
  setSelectedChild,
  addMember,
  dispatch,
  omit = [],
}: CharacterFilterProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    character_type: null,
    archetypes: [],
    archetype: null,
    characters: [],
    factions: [],
    selectedChild: null,
  })
  const {
    character_type,
    archetypes,
    archetype,
    characters,
    factions,
    faction_id,
    selectedChild,
  } = formState.data

  const character_id = selectedChild?.id

  console.log("character_id", character_id)

  const fetchCharacters = useCallback(async () => {
    try {
      const response = await client.getCharacterNames({
        faction_id,
        type: character_type,
        archetype: archetype,
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
  }, [client, faction_id, character_type, archetype, dispatchForm])

  useEffect(() => {
    if (!dispatch) return
    // update the set of characters outside the component
    dispatch({
      type: FormActions.UPDATE,
      name: "character_type",
      value: character_type,
    })
    dispatch({ type: FormActions.UPDATE, name: "archetype", value: archetype })
    dispatch({
      type: FormActions.UPDATE,
      name: "faction_id",
      value: faction_id,
    })
  }, [character_type, faction_id, archetype, dispatch])

  useEffect(() => {
    fetchCharacterTypes()
  }, [])

  useEffect(() => {
    fetchCharacters()
      .catch(error => {
        console.error("Error in useEffect fetchCharacters:", error)
      })
      .then(() => {
        dispatchForm({
          type: FormActions.EDIT,
          name: "loading",
          value: false,
        })
      })
  }, [
    client,
    dispatchForm,
    character_type,
    selectedChild,
    faction_id,
    fetchCharacters,
  ])

  const handleCharacterChange = (character: Character | null) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "selectedChild",
      value: character,
    })
    setSelectedChild(character)
  }

  const handleFactionChange = (value: string | null) => {
    console.log("faction change value", value)
    dispatchForm({
      type: FormActions.UPDATE,
      name: "faction_id",
      value: value?.id,
    })
  }

  const handleArchetypeChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "archetype", value: value })
  }

  const handleTypeChange = (value: string | null) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "character_type",
      value: value,
    })
  }

  const fetchArchetypes = async () => {
    const opts = archetypes.map(archetype => ({
      label: archetype,
      value: archetype,
    }))
    return Promise.resolve(opts)
  }

  const fetchCharacterTypes = async () => {
    const characterTypes = [
      "Ally",
      "PC",
      "Mook",
      "Featured Foe",
      "Boss",
      "Uber-Boss",
    ].map(type => ({
      label: type,
      value: type,
    }))
    return Promise.resolve(characterTypes)
  }

  const handleAddMember = () => {
    console.log("add", selectedChild)
    addMember?.(selectedChild)
    dispatchForm({
      type: FormActions.UPDATE,
      name: "selectedChild",
      value: null,
    })
    setSelectedChild(null)
  }

  return (
    <Box
      sx={{
        mb: 2,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems="center"
        sx={{ width: "100%" }}
      >
        {!omit.includes("type") && (
          <Autocomplete
            label="Type"
            value={character_type || ""}
            fetchOptions={fetchCharacterTypes}
            onChange={handleTypeChange}
            allowNone={false}
          />
        )}
        {!omit.includes("archetype") && (
          <Autocomplete
            label="Archetype"
            value={archetype || ""}
            fetchOptions={fetchArchetypes}
            onChange={handleArchetypeChange}
            allowNone={false}
          />
        )}
        {!omit.includes("faction") && (
          <FactionAutocomplete
            options={factions.map(faction => ({
              label: faction.name || "",
              value: faction.id || "",
            }))}
            value={faction_id || ""}
            onChange={handleFactionChange}
            allowNone={false}
          />
        )}
        {!omit.includes("character") && (
          <CharacterAutocomplete
            options={characters.map(character => ({
              label: character.name || "",
              value: character.id || "",
            }))}
            value={character_id || ""}
            onChange={handleCharacterChange}
            allowNone={false}
          />
        )}
        <AddButton onClick={handleAddMember} disabled={!selectedChild} />
      </Stack>
    </Box>
  )
}
