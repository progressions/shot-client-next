"use client"

import type { Character } from "@/types"
import { useToast, useClient, useCampaign } from "@/contexts"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useMediaQuery, Box, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { CS } from "@/services"
import {
  InfoLink,
  Icon,
  NameEditor,
  SectionHeader,
  PositionableImage,
  RichDescription,
} from "@/components/ui"
import {
  CharacterSpeedDial,
  EditOwner,
  EditNotionLink,
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
  EditColor,
  SkillsManager,
  AdvancementsManager,
  IsTemplateToggle,
  NotionSyncLogList,
} from "@/components/characters"
import { EditFaction } from "@/components/factions"
import {
  EntityActiveToggle,
  EntityAtAGlanceToggle,
  EntityTaskToggle,
} from "@/components/common"

type ShowProps = {
  character: Character
  initialIsMobile?: boolean
}

export default function Show({
  character: initialCharacter,
  initialIsMobile = false,
}: ShowProps) {
  const { subscribeToEntity, campaign } = useCampaign()
  const { client, user } = useClient()
  const { toastSuccess } = useToast()
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down("sm"))
  const isMobile = initialIsMobile || smallScreen

  const [character, setCharacter] = useState<Character>(initialCharacter)

  useEffect(() => {
    document.title = character.name ? `${character.name} - Chi War` : "Chi War"
  }, [character.name])

  // Subscribe to character updates
  // This also handles image updates from ImageCopyWorker after character duplication
  useEffect(() => {
    const unsubscribe = subscribeToEntity("character", data => {
      if (data && data.id === initialCharacter.id) {
        setCharacter(data)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialCharacter.id])

  const updateCharacter = useCallback(
    async updatedCharacter => {
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
    },
    [character.id, client, toastSuccess]
  )

  // Handle change and save for EntityActiveToggle and EntityAtAGlanceToggle
  const handleChangeAndSave = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      // Use checked for checkbox inputs, value for others
      const newValue =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value
      const updatedCharacter = {
        ...character,
        [event.target.name]: newValue,
      }
      await updateCharacter(updatedCharacter)
    },
    [character, updateCharacter]
  )

  // Memoize character to prevent unnecessary re-renders
  const memoizedCharacter = useMemo(() => character, [character])

  // Check permissions for administrative controls
  const hasAdminPermission =
    user?.admin || (campaign && user?.id === campaign.gamemaster_id)

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <CharacterSpeedDial
        character={memoizedCharacter}
        onCharacterUpdate={setCharacter}
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
      <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 1 }}>
        <EditOwner
          character={memoizedCharacter}
          updateCharacter={updateCharacter}
        />
        <EditNotionLink
          character={memoizedCharacter}
          updateCharacter={updateCharacter}
        />
      </Stack>
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
        <EditColor
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

      {memoizedCharacter.rich_description && (
        <Box sx={{ mb: 2 }}>
          <SectionHeader
            title="Full Description"
            icon={<Icon keyword="Description" />}
            sx={{ mb: 2 }}
          >
            Extended description with linked mentions to other entities.
          </SectionHeader>
          <RichDescription
            markdown={memoizedCharacter.rich_description}
            mentions={memoizedCharacter.mentions}
          />
        </Box>
      )}

      {memoizedCharacter.action_values?.Type === "PC" && (
        <AdvancementsManager character={memoizedCharacter} />
      )}

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

      {hasAdminPermission && (
        <>
          <SectionHeader
            title="Administrative Controls"
            icon={<Icon keyword="Administration" />}
          >
            Manage the visibility and status of this character.
          </SectionHeader>
          <Stack direction="row" spacing={3} sx={{ my: 1 }}>
            <EntityActiveToggle
              entity={memoizedCharacter}
              handleChangeAndSave={handleChangeAndSave}
            />
            <EntityAtAGlanceToggle
              entity={memoizedCharacter}
              handleChangeAndSave={handleChangeAndSave}
            />
            <EntityTaskToggle
              entity={memoizedCharacter}
              handleChangeAndSave={handleChangeAndSave}
            />
            <IsTemplateToggle
              character={memoizedCharacter}
              handleChangeAndSave={handleChangeAndSave}
            />
          </Stack>
          <NotionSyncLogList
            entity={memoizedCharacter}
            entityType="character"
            onSync={setCharacter}
          />
        </>
      )}
    </Box>
  )
}
