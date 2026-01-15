"use client"

import { useCallback, useEffect } from "react"
import { FormControl, FormHelperText, Stack, Box } from "@mui/material"
import type { Adventure } from "@/types"
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
} from "@/components/ui"
import { AdventureSpeedDial } from "@/components/adventures"
import {
  EntityActiveToggle,
  EntityAtAGlanceToggle,
  EditEntityNotionLink,
} from "@/components/common"
import { NotionSyncLogList } from "@/components/characters"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"

interface ShowProperties {
  adventure: Adventure
}

type FormStateData = {
  entity: Adventure & {
    image?: File | null
  }
}

export default function Show({ adventure: initialAdventure }: ShowProperties) {
  const { subscribeToEntity, campaign } = useCampaign()
  const { user } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialAdventure,
  })
  const { status, errors } = formState
  const adventure = formState.data.entity

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    adventure,
    dispatchForm
  )

  const setAdventure = useCallback(
    (adventure: Adventure) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: adventure,
      })
    },
    [dispatchForm]
  )

  useEffect(() => {
    document.title = adventure.name
      ? `${adventure.name} - Chi War`
      : "Chi War"
  }, [adventure.name])

  // Subscribe to adventure updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("adventure", data => {
      if (data && data.id === initialAdventure.id) {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...data },
        })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialAdventure.id, dispatchForm])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <AdventureSpeedDial adventure={adventure} onDelete={deleteEntity} />
      <HeroImage entity={adventure} setEntity={setAdventure} />
      <Alert status={status} />
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ my: 1, flexWrap: "wrap" }}
      >
        <FormControl error={!!errors.name} sx={{ flexGrow: 1 }}>
          <NameEditor
            entity={adventure}
            setEntity={setAdventure}
            updateEntity={updateEntity}
          />
          {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
        </FormControl>
        <EditEntityNotionLink
          entity={adventure}
          entityType="adventure"
          updateEntity={setAdventure}
        />
      </Stack>
      <Box sx={{ mb: 2 }}>
        <SectionHeader
          title="Description"
          icon={<Icon keyword="Description" />}
          sx={{ mb: 2 }}
        >
          Description of this <InfoLink href="/adventures" info="Adventure" />,
          including the storyline, goals, and key events.
        </SectionHeader>
        <EditableRichText
          name="description"
          html={adventure.description}
          editable={true}
          onChange={handleChangeAndSave}
          fallback="No description available."
        />
      </Box>
      <Stack direction="column" spacing={4}>
        <Manager
          icon={<Icon keyword="Fighters" size="24" />}
          parentEntity={adventure}
          childEntityName="Character"
          title="Heroes"
          relationship="characters"
          description={
            <>
              The <InfoLink href="/characters" info="Characters" /> who are the
              heroes of this <InfoLink href="/adventures" info="Adventure" />.
            </>
          }
          onListUpdate={updateEntity}
        />
        <Manager
          icon={<Icon keyword="Villains" size="24" />}
          parentEntity={adventure}
          childEntityName="Character"
          title="Villains"
          relationship="villains"
          description={
            <>
              The <InfoLink href="/characters" info="Characters" /> who are the
              villains of this <InfoLink href="/adventures" info="Adventure" />.
            </>
          }
          onListUpdate={updateEntity}
        />
        <Manager
          icon={<Icon keyword="Fights" size="24" />}
          parentEntity={adventure}
          childEntityName="Fight"
          title="Fights"
          relationship="fights"
          description={
            <>
              The <InfoLink href="/fights" info="Fights" /> that take place
              during this <InfoLink href="/adventures" info="Adventure" />.
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
            Manage the visibility and status of this adventure.
          </SectionHeader>
          <Stack direction="column" spacing={2} sx={{ my: 2 }}>
            <EntityActiveToggle
              entity={adventure}
              handleChangeAndSave={handleChangeAndSave}
            />
            <EntityAtAGlanceToggle
              entity={adventure}
              handleChangeAndSave={handleChangeAndSave}
            />
          </Stack>
          <NotionSyncLogList
            entity={adventure}
            entityType="adventure"
            onSync={setAdventure}
          />
        </>
      )}
    </Box>
  )
}
