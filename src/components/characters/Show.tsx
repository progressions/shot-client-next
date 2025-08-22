"use client"

import type { Character } from "@/types"
import { useToast, useClient, useCampaign } from "@/contexts"
import { useState, useEffect, useMemo } from "react"
import { useMediaQuery, Box, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { CS } from "@/services"
import {
  InfoLink,
  Icon,
  NameEditor,
  SectionHeader,
  PositionableImage,
} from "@/components/ui"
import {
  CharacterSpeedDial,
  EditOwner,
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
import { EditFaction } from "@/components/factions"

type ShowProps = {
  character: Character
  initialIsMobile?: boolean
}

export default function Show({
  character: initialCharacter,
  initialIsMobile = false,
}: ShowProps) {
  const { subscribeToEntity } = useCampaign()
  const { client } = useClient()
  const { toastSuccess } = useToast()
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down("sm"))
  const isMobile = initialIsMobile || smallScreen

  const [character, setCharacter] = useState<Character>(initialCharacter)

  useEffect(() => {
    document.title = character.name ? `${character.name} - Chi War` : "Chi War"
  }, [character.name])

  // Subscribe to character updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("character", data => {
      if (data && data.id === initialCharacter.id) {
        setCharacter(data)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialCharacter.id])

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
      <EditOwner
        character={memoizedCharacter}
        updateCharacter={updateCharacter}
      />
      <SectionHeader
        title="Action Values"
        icon={<Icon keyword="Action Values" />}
      >
        <InfoLink info="Action Values" /> are the core stats of your{" "}
        <InfoLink href="/characters" info="Character" />, used to resolve
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
        Personal details about your{" "}
        <InfoLink href="/characters" info="Character" />, such as their{" "}
        <InfoLink info="Type" />, <InfoLink info="Archetype" />,
        <InfoLink info="Juncture" />, and <InfoLink info="Wealth" />.
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
        <EditFaction
          entity={memoizedCharacter}
          updateEntity={updateCharacter}
        />
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
      <Parties
        character={memoizedCharacter}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />
      {!CS.isMook(memoizedCharacter) && (
        <Sites
          character={memoizedCharacter}
          setCharacter={setCharacter}
          updateCharacter={updateCharacter}
        />
      )}
    </Box>
  )
}
