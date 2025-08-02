"use client"

import type { Character } from "@/types"
import { useToast, useClient, useCampaign } from "@/contexts"
import { useState, useEffect, useMemo } from "react"
import { Box, Stack } from "@mui/material"
import { CharacterSpeedDial, NameEditor } from "@/components/characters"
import { CS } from "@/services"
import {
  Owner,
  Associations,
  ActionValuesEdit,
  Skills,
  Weapons,
  Description,
  Schticks,
  Parties,
  Sites,
} from "@/components/characters"

type EditCharacterProps = {
  character: Character
}

export default function EditCharacter({
  character: initialCharacter,
}: EditCharacterProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()
  const { toastError } = useToast()
  const [character, setCharacter] = useState<Character>(initialCharacter)

  useEffect(() => {
    document.title = character.name ? `${character.name} - Chi War` : "Chi War"
  }, [character.name])

  useEffect(() => {
    if (
      campaignData?.character &&
      campaignData.character.id === initialCharacter.id
    ) {
      setCharacter(campaignData.character)
    }
  }, [campaignData, initialCharacter])

  const updateCharacter = async updatedCharacter => {
    try {
      console.log("Updating character:", updatedCharacter)
      setCharacter(updatedCharacter)

      const formData = new FormData()
      const characterData = {
        ...updatedCharacter,
        schticks: undefined,
        parties: undefined,
        sites: undefined,
        weapons: undefined,
      }
      formData.append("character", JSON.stringify(characterData))
      const response = await client.updateCharacter(character.id, formData)
      console.log("just updated character", response.data)
      setCharacter(response.data)
    } catch (error) {
      const nameErrors = error.response?.data?.errors?.name
      const errorMessage =
        Array.isArray(nameErrors) && nameErrors.length > 0
          ? nameErrors[0]
          : "Failed to update character"
      toastError(`Error updating character: ${errorMessage}`)
      console.error("Error updating character:", errorMessage)
      throw new Error(errorMessage) // Rethrow to let NameEditor handle serverError
    }
  }

  // Memoize character to prevent unnecessary re-renders
  const memoizedCharacter = useMemo(() => character, [character])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <CharacterSpeedDial
        editing={true}
        character={memoizedCharacter}
        setCharacter={setCharacter}
      />
      <NameEditor
        character={memoizedCharacter}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />
      <Owner character={memoizedCharacter} />
      <ActionValuesEdit
        character={memoizedCharacter}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />
      {!CS.isMook(memoizedCharacter) && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            gap: { xs: 1, md: 2 },
            "& > *": {
              flex: { md: 1 },
              width: { xs: "100%", md: "50%" },
            },
          }}
        >
          <Associations character={memoizedCharacter} />
          <Skills character={memoizedCharacter} />
        </Stack>
      )}
      <Description character={memoizedCharacter} />
      <Weapons character={memoizedCharacter} />
      {!CS.isMook(memoizedCharacter) && (
        <Schticks character={memoizedCharacter} setCharacter={setCharacter} />
      )}
      <Parties character={memoizedCharacter} setCharacter={setCharacter} />
      {!CS.isMook(memoizedCharacter) && (
        <Sites character={memoizedCharacter} setCharacter={setCharacter} />
      )}
    </Box>
  )
}

/*
export default function EditCharacter({
  character: initialCharacter,
}: EditCharacterProps) {
  const { client } = useClient()
  const [character, setCharacter] = useState(initialCharacter)
  const [value, setValue] = useState<number | null>(CS.defense(initialCharacter))

  const updateCharacter = async (updatedCharacter) => {
    console.log("Updating character:", updatedCharacter)
    setCharacter(updatedCharacter)

    const formData = new FormData()
    const characterData = {
      ...updatedCharacter,
      schticks: undefined,
      parties: undefined,
      sites: undefined,
      weapons: undefined
    }
    formData.append("character", JSON.stringify(characterData))
    const response = await client.updateCharacter(character.id, formData)
    console.log("just updated character", response.data)
    setCharacter(response.data)
  }

  return (
    <ActionValueEdit
      name="Defense"
      value={value}
      character={character}
      setCharacter={setCharacter}
      updateCharacter={updateCharacter}
    />
  )
}
*/
