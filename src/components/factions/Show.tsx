"use client"

import { useCallback, useEffect } from "react"
import { Stack, Box } from "@mui/material"
import type { Faction } from "@/types"
import { useCampaign, useClient } from "@/contexts"
import { JuncturesList, SitesList, PartiesList } from "@/components/factions"
import {
  Icon,
  Alert,
  Manager,
  InfoLink,
  NameEditor,
  HeroImage,
  SpeedDialMenu,
  EditableRichText,
  SectionHeader,
} from "@/components/ui"
import { EntityActiveToggle } from "@/components/common"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"

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
  const { user } = useClient()
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

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage entity={faction} setEntity={setFaction} />
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
          entity={faction}
          setEntity={setFaction}
          updateEntity={updateEntity}
        />
      </Box>
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

      <Stack direction="column" spacing={2}>
        <Manager
          name="faction"
          title="Attuned Characters"
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
          <EntityActiveToggle
            entity={faction}
            handleChangeAndSave={handleChangeAndSave}
          />
        </>
      )}
    </Box>
  )
}
