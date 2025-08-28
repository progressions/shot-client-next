"use client"

import { useCallback, useEffect } from "react"
import { Stack, Box } from "@mui/material"
import type { Juncture } from "@/types"
import { useCampaign, useClient } from "@/contexts"
import {
  Alert,
  Manager,
  HeroImage,
  SpeedDialMenu,
  SectionHeader,
  EditableRichText,
  NameEditor,
  InfoLink,
  Icon,
} from "@/components/ui"
import { EntityActiveToggle } from "@/components/common"
import { useEntity } from "@/hooks"
import { EditFaction } from "@/components/factions"
import { FormActions, useForm } from "@/reducers"

interface ShowProperties {
  juncture: Juncture
}

type FormStateData = {
  entity: Juncture & {
    image?: File | null
  }
}

export default function Show({ juncture: initialJuncture }: ShowProperties) {
  const { subscribeToEntity, campaign } = useCampaign()
  const { user } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialJuncture,
  })
  const { status } = formState
  const juncture = formState.data.entity

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    juncture,
    dispatchForm
  )

  const setJuncture = useCallback(
    (juncture: Juncture) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: juncture,
      })
    },
    [dispatchForm]
  )

  useEffect(() => {
    document.title = juncture.name ? `${juncture.name} - Chi War` : "Chi War"
  }, [juncture.name])

  // Subscribe to juncture updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("juncture", data => {
      if (data && data.id === initialJuncture.id) {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...data },
        })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialJuncture.id, dispatchForm])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage entity={juncture} setEntity={setJuncture} />
      <Alert status={status} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <NameEditor
          entity={juncture}
          setEntity={setJuncture}
          updateEntity={updateEntity}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <SectionHeader title="Faction" icon={<Icon keyword="Factions" />}>
          A <InfoLink href="/junctures" info="Juncture" /> belongs to a{" "}
          <InfoLink href="/factions" info="Faction" />, which controls its most
          powerful <InfoLink href="/sites" info="Feng Shui Sites" />.
        </SectionHeader>
        <Box sx={{ width: 400, mt: 3, mb: 4 }}>
          <EditFaction entity={juncture} updateEntity={updateEntity} />
        </Box>
      </Box>
      <Box>
        <SectionHeader
          title="Description"
          icon={<Icon keyword="Description" />}
        />
        <EditableRichText
          name="description"
          html={juncture.description}
          editable={true}
          onChange={handleChangeAndSave}
          fallback="No description available."
        />
      </Box>

      <Stack direction="column" spacing={2}>
        <Manager
          icon={<Icon keyword="Fighters" />}
          name="juncture"
          title="Juncture Natives"
          parentEntity={juncture}
          childEntityName="Character"
          description={
            <>
              <InfoLink href="/characters" info="Characters" /> born into a
              specific <InfoLink href="/junctures" info="Juncture" /> often
              travel through the <InfoLink info="Netherworld" />, participating
              in the <InfoLink info="Chi War" />, enaging in its conflicts and
              shaping its outcomes.
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
            Manage the visibility and status of this juncture.
          </SectionHeader>
          <EntityActiveToggle
            entityType="Juncture"
            entityId={juncture.id}
            currentActive={juncture.active ?? true}
            handleChangeAndSave={handleChangeAndSave}
          />
        </>
      )}
    </Box>
  )
}
