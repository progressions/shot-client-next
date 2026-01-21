"use client"

import { useCallback, useEffect, useMemo } from "react"
import { FormControl, FormHelperText, Stack, Box } from "@mui/material"
import type { Party } from "@/types"
import { useCampaign, useClient } from "@/contexts"
import {
  Manager,
  Icon,
  InfoLink,
  Alert,
  NameEditor,
  EditableRichText,
  SectionHeader,
  HeroImage,
  RichDescription,
  BacklinksModal,
} from "@/components/ui"
import { PartySpeedDial, PartyCompositionBuilder } from "@/components/parties"
import {
  EntityActiveToggle,
  EntityAtAGlanceToggle,
  EditEntityNotionLink,
} from "@/components/common"
import { NotionSyncLogList } from "@/components/characters"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"
import { EditFaction } from "@/components/factions"
import { createBacklinksFetcher } from "@/lib/backlinks"

interface ShowProperties {
  party: Party
}

type FormStateData = {
  entity: Party & {
    image?: File | null
  }
}

export default function Show({ party: initialParty }: ShowProperties) {
  const { subscribeToEntity, campaign } = useCampaign()
  const { user, client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialParty,
  })
  const { status, errors } = formState
  const party = formState.data.entity

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    party,
    dispatchForm
  )

  const setParty = useCallback(
    (party: Party) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: party,
      })
    },
    [dispatchForm]
  )

  useEffect(() => {
    document.title = party.name ? `${party.name} - Chi War` : "Chi War"
  }, [party.name])

  // Subscribe to party updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("party", data => {
      if (data && data.id === initialParty.id) {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...data },
        })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialParty.id, dispatchForm])

  const fetchBacklinks = useMemo(() => createBacklinksFetcher(client), [client])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <PartySpeedDial party={party} onDelete={deleteEntity} />
      <HeroImage entity={party} setEntity={setParty} />
      <Box sx={{ mb: 1 }}>
        <BacklinksModal
          entityId={party.id}
          entityType="party"
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
        <FormControl error={!!errors.name} sx={{ flexGrow: 1 }}>
          <NameEditor
            entity={party}
            setEntity={setParty}
            updateEntity={updateEntity}
          />
          {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
        </FormControl>
        <EditEntityNotionLink
          entity={party}
          entityType="party"
          updateEntity={setParty}
        />
      </Stack>
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Faction"
          icon={<Icon keyword="Factions" />}
          sx={{ mb: 2 }}
        >
          A <InfoLink href="/parties" info="Party" /> belongs to a{" "}
          <InfoLink href="/factions" info="Faction" />, which governs its aims
          and objectives.
        </SectionHeader>
        <Box sx={{ width: 400 }}>
          <EditFaction entity={party} updateEntity={updateEntity} />
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <SectionHeader
          title="Description"
          icon={<Icon keyword="Description" />}
          sx={{ mb: 2 }}
        >
          Description of this <InfoLink href="/parties" info="Party" />,
          including its members, goals, and notable activities.
        </SectionHeader>
        <EditableRichText
          name="description"
          html={party.description}
          editable={true}
          onChange={handleChangeAndSave}
          fallback="No description available."
        />
      </Box>
      {party.rich_description && (
        <Box sx={{ mb: 2 }}>
          <SectionHeader
            title="Full Description"
            icon={<Icon keyword="Description" />}
            sx={{ mb: 2 }}
          >
            Extended description with linked mentions to other entities.
          </SectionHeader>
          <RichDescription
            markdown={party.rich_description}
            mentions={party.mentions}
          />
        </Box>
      )}
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Party Composition"
          icon={<Icon keyword="Fighters" />}
          sx={{ mb: 2 }}
        >
          Define the role-based composition of this party. Use templates for
          quick setup, or add slots manually.
        </SectionHeader>
        <PartyCompositionBuilder
          party={party}
          onUpdate={setParty}
          isEditing={true}
        />
      </Box>
      <Stack direction="column" spacing={2}>
        <Manager
          icon={<Icon keyword="Fighters" size="24" />}
          parentEntity={party}
          childEntityName="Character"
          title="Party Members"
          description={
            <>
              A <InfoLink href="/parties" info="Party" /> consists of{" "}
              <InfoLink href="/characters" info="Characters" /> who work
              together for a <InfoLink href="/factions" info="Faction" />.
            </>
          }
          onListUpdate={updateEntity}
        />
      </Stack>
      {(user?.admin || (campaign && user?.id === campaign.gamemaster_id)) && (
        <>
          <SectionHeader
            title="Administrative Controls"
            icon={<Icon keyword="Administration" />}
          >
            Manage the visibility and status of this party.
          </SectionHeader>
          <Stack direction="column" spacing={2} sx={{ my: 2 }}>
            <EntityActiveToggle
              entity={party}
              handleChangeAndSave={handleChangeAndSave}
            />
            <EntityAtAGlanceToggle
              entity={party}
              handleChangeAndSave={handleChangeAndSave}
            />
          </Stack>
          <NotionSyncLogList
            entity={party}
            entityType="party"
            onSync={setParty}
          />
        </>
      )}
    </Box>
  )
}
