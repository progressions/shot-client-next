"use client"

import { useCallback, useEffect, useMemo } from "react"
import { Stack, Box } from "@mui/material"
import type { Faction } from "@/types"
import { useCampaign, useClient } from "@/contexts"
import {
  JuncturesList,
  SitesList,
  PartiesList,
  FactionSpeedDial,
} from "@/components/factions"
import {
  Icon,
  Alert,
  Manager,
  InfoLink,
  NameEditor,
  HeroImage,
  EditableRichText,
  SectionHeader,
  RichDescription,
  BacklinksModal,
} from "@/components/ui"
import {
  EntityActiveToggle,
  EntityAtAGlanceToggle,
  EditEntityNotionLink,
} from "@/components/common"
import { NotionSyncLogList } from "@/components/characters"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"
import { createBacklinksFetcher } from "@/lib/backlinks"

interface ShowProperties {
  faction: Faction
}

type FormStateData = {
  entity: Faction & {
    image?: File | null
  }
}

export default function Show({ faction: initialFaction }: ShowProperties) {
  const { campaignData, campaign } = useCampaign()
  const { user, client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialFaction,
  })
  const { status } = formState
  const faction = formState.data.entity

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    faction,
    dispatchForm
  )

  const setFaction = useCallback(
    (faction: Faction) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: faction,
      })
    },
    [dispatchForm]
  )

  useEffect(() => {
    document.title = faction.name ? `${faction.name} - Chi War` : "Chi War"
  }, [faction.name])

  useEffect(() => {
    if (
      campaignData?.faction &&
      campaignData.faction.id === initialFaction.id
    ) {
      setFaction(campaignData.faction)
    }
  }, [campaignData, initialFaction, setFaction])

  const fetchBacklinks = useMemo(() => createBacklinksFetcher(client), [client])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <FactionSpeedDial faction={faction} onDelete={deleteEntity} />
      <HeroImage entity={faction} setEntity={setFaction} />
      <Box sx={{ mb: 1 }}>
        <BacklinksModal
          entityId={faction.id}
          entityType="faction"
          fetchBacklinks={fetchBacklinks}
        />
      </Box>
      <Alert status={status} />
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ my: 1, flexWrap: "wrap" }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <NameEditor
            entity={faction}
            setEntity={setFaction}
            updateEntity={updateEntity}
          />
        </Box>
        <EditEntityNotionLink
          entity={faction}
          entityType="faction"
          updateEntity={setFaction}
        />
      </Stack>
      <Box>
        <SectionHeader
          title="Description"
          icon={<Icon keyword="Description" />}
        />
        <EditableRichText
          name="description"
          html={faction.description}
          editable={true}
          onChange={handleChangeAndSave}
          fallback="No description available."
        />
      </Box>
      {faction.rich_description && (
        <Box sx={{ mb: 2 }}>
          <SectionHeader
            title="Full Description"
            icon={<Icon keyword="Description" />}
            sx={{ mb: 2 }}
          >
            Extended description with linked mentions to other entities.
          </SectionHeader>
          <RichDescription
            markdown={faction.rich_description}
            mentions={faction.mentions}
          />
        </Box>
      )}

      <Stack direction="column" spacing={2}>
        <Manager
          name="faction"
          title="Members"
          parentEntity={faction}
          childEntityName="Character"
          description={
            <>
              A <InfoLink href="/factions" info="Faction" /> recruits{" "}
              <InfoLink href="/characters" info="Characters" /> to join its
              cause, acting as a unified force in the world of the{" "}
              <InfoLink info="Chi War" />.
            </>
          }
          onListUpdate={updateEntity}
        />
        <PartiesList entity={faction} updateEntity={updateEntity} />
        <SitesList entity={faction} updateEntity={updateEntity} />
        <JuncturesList entity={faction} updateEntity={updateEntity} />
      </Stack>
      {(user?.admin || (campaign && user?.id === campaign.gamemaster_id)) && (
        <>
          <SectionHeader
            title="Administrative Controls"
            icon={<Icon keyword="Administration" />}
          >
            Manage the visibility and status of this faction.
          </SectionHeader>
          <Stack direction="column" spacing={2} sx={{ my: 2 }}>
            <EntityActiveToggle
              entity={faction}
              handleChangeAndSave={handleChangeAndSave}
            />
            <EntityAtAGlanceToggle
              entity={faction}
              handleChangeAndSave={handleChangeAndSave}
            />
          </Stack>
          <NotionSyncLogList
            entity={faction}
            entityType="faction"
            onSync={setFaction}
          />
        </>
      )}
    </Box>
  )
}
