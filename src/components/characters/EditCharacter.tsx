"use client"

import type { Character } from "@/types"
import { useToast, useClient, useCampaign } from "@/contexts"
import { useState, useEffect, useMemo } from "react"
import { useMediaQuery, Box, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { CS } from "@/services"
import { NameEditor, SectionHeader, PositionableImage } from "@/components/ui"
import {
  CharacterSpeedDial,
  Owner,
  ActionValuesEdit,
  Weapons,
  Description,
  Schticks,
  Parties,
  Sites,
  EditType,
  EditArchetype,
  EditJuncture,
  EditWealth,
  SkillsManager,
} from "@/components/characters"
import { Icon } from "@/lib"

type EditCharacterProps = {
  character: Character
  initialIsMobile?: boolean
}

export default function EditCharacter({
  character: initialCharacter,
  initialIsMobile = false,
}: EditCharacterProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down("sm"))
  const isMobile = initialIsMobile || smallScreen

  const [character, setCharacter] = useState<Character>(initialCharacter)

  // console.log("character length", JSON.stringify(character).length)

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
      setCharacter(response.data)
      toastSuccess("Character updated successfully")

      return response.data
    } catch (error) {
      console.error("Error updating character:", error)
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
      <PositionableImage
        entity={memoizedCharacter}
        pageContext="edit"
        height={400}
        isMobile={isMobile}
        setEntity={setCharacter}
      />
      <NameEditor
        entity={memoizedCharacter}
        setEntity={setCharacter}
        updateEntity={updateCharacter}
      />
      <Owner character={memoizedCharacter} />
      <SectionHeader
        title="Action Values"
        icon={<Icon keyword="Action Values" />}
      >
        Action Values are the core stats of your Character, used to resolve
        actions and challenges in the game.
      </SectionHeader>
      <ActionValuesEdit
        character={memoizedCharacter}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />

      <SectionHeader
        title="Personal Details"
        icon={<Icon keyword="Personal Details" />}
      >
        Personal details about your character, such as their type, archetype,
        juncture, and wealth.
      </SectionHeader>
      <Stack direction="row" spacing={2} sx={{ my: 2 }}>
        <EditType
          character={memoizedCharacter}
          updateCharacter={updateCharacter}
        />
        <EditArchetype
          character={memoizedCharacter}
          updateCharacter={updateCharacter}
        />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ my: 2 }}>
        <EditJuncture
          character={memoizedCharacter}
          updateCharacter={updateCharacter}
        />
        <EditWealth
          character={memoizedCharacter}
          updateCharacter={updateCharacter}
        />
      </Stack>

      <SkillsManager
        character={memoizedCharacter}
        updateCharacter={updateCharacter}
      />

      <Description
        character={memoizedCharacter}
        updateCharacter={updateCharacter}
      />

      <Weapons
        character={memoizedCharacter}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />
      {!CS.isMook(memoizedCharacter) && (
        <Schticks
          character={memoizedCharacter}
          setCharacter={setCharacter}
          updateCharacter={updateCharacter}
        />
      )}
      <Parties character={memoizedCharacter} setCharacter={setCharacter} />
      {!CS.isMook(memoizedCharacter) && (
        <Sites character={memoizedCharacter} setCharacter={setCharacter} />
      )}
    </Box>
  )
}
