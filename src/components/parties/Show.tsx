"use client"

import { useCallback, useEffect } from "react"
import { Stack, Box } from "@mui/material"
import type { Party } from "@/types"
import { useCampaign } from "@/contexts"
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
import { useEntity } from "@/hooks"
import { EditFaction } from "@/components/factions"
import { FormActions, useForm } from "@/reducers"

interface ShowProperties {
  party: Party
}

type FormStateData = {
  entity: Party & {
    image?: File | null
  }
}

export default function Show({ party: initialParty }: ShowProperties) {
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialParty,
  })
  const { status } = formState
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

  useEffect(() => {
    if (campaignData?.party && campaignData.party.id === initialParty.id) {
      setParty(campaignData.party)
    }
  }, [campaignData, initialParty, setParty])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage entity={party} setEntity={setParty} />
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
          entity={party}
          setEntity={setParty}
          updateEntity={updateEntity}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <SectionHeader title="Faction" icon={<Icon keyword="Factions" />}>
          A <InfoLink href="/parties" info="Party" /> belongs to a{" "}
          <InfoLink href="/factions" info="Faction" />, which governs its aims
          and objectives.
        </SectionHeader>
        <Box sx={{ width: 400 }}>
          <EditFaction entity={party} updateEntity={updateEntity} />
        </Box>
      </Box>
      <Box>
        <SectionHeader
          title="Description"
          icon={<Icon keyword="Description" />}
        />
        <EditableRichText
          name="description"
          html={party.description}
          editable={true}
          onChange={handleChangeAndSave}
          fallback="No description available."
        />
      </Box>

      <Stack direction="column" spacing={2}>
        <Manager
          icon={<Icon keyword="Fighters" />}
          name="party"
          title="Party Members"
          parentEntity={party}
          childEntityName="Character"
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
    </Box>
  )
}
