"use client"

import type { Character } from "@/types"
import { useToast, useClient, useCampaign } from "@/contexts"
import { useState, useEffect } from "react"
import { Box, Stack, FormControl, FormHelperText } from "@mui/material"
import { TextField } from "@/components/ui"
import { CharacterSpeedDial } from "@/components/characters"
import { CS } from "@/services"

import {
  Owner,
  Associations,
  ActionValues,
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
  const { toastSuccess, toastError } = useToast()
  const [character, setCharacter] = useState<Character>(initialCharacter)
  const [nameError, setNameError] = useState<string>("")
  const [serverError, setServerError] = useState<string>("")

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

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "Character name is required"
    }
    return ""
  }

  const updateCharacter = async (updatedCharacter: Character) => {
    try {
      const formData = new FormData()
      const characterData = { ...updatedCharacter, schticks: undefined, parties: undefined, sites: undefined }
      formData.append("character", JSON.stringify(characterData))
      const response = await client.updateCharacter(character.id, formData)
      setCharacter(response.data)
      setServerError("") // Clear server error on success
      toastSuccess("Character updated successfully")
    } catch (error) {
      const nameErrors = error.response?.data?.errors?.name
      const errorMessage = Array.isArray(nameErrors) && nameErrors.length > 0
        ? nameErrors[0]
        : "Failed to update character"
      setServerError(errorMessage)
      toastError(`Error updating character: ${errorMessage}`)
      console.error("Error updating character:", errorMessage)
    }
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value
    const updatedCharacter = { ...character, name: newName }
    setCharacter(updatedCharacter)
    setNameError("") // Clear client-side error while typing
    setServerError("") // Clear server-side error while typing
  }

  const handleNameBlur = () => {
    const error = validateName(character.name)
    setNameError(error)
    if (!error) {
      updateCharacter(character)
    }
  }

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <CharacterSpeedDial
        character={character}
        client={client}
        setCharacter={setCharacter}
      />
      <FormControl fullWidth error={!!nameError || !!serverError} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Character Name"
          value={character.name || ""}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          error={!!nameError || !!serverError}
          sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ffffff" }}
        />
        {(nameError || serverError) && (
          <FormHelperText sx={{ mt: 1 }}>{nameError || serverError}</FormHelperText>
        )}
      </FormControl>
      <Owner character={character} />
      <ActionValues character={character} />
      {!CS.isMook(character) && (
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
          <Associations character={character} />
          <Skills character={character} />
        </Stack>
      )}
      <Description character={character} />
      <Weapons character={character} />
      {!CS.isMook(character) && (
        <Schticks character={character} setCharacter={setCharacter} />
      )}
      <Parties character={character} setCharacter={setCharacter} />
      {!CS.isMook(character) && (
        <Sites character={character} setCharacter={setCharacter} />
      )}
    </Box>
  )
}
