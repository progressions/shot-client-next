"use client"

import { useCallback, useEffect } from "react"
import { FormControl, FormHelperText, Stack, Box } from "@mui/material"
import type { Party } from "@/types"
import { useCampaign } from "@/contexts"
import {
  Manager,
  Icon,
  InfoLink,
  Alert,
  NameEditor,
  EditableRichText,
  SectionHeader,
  HeroImage,
  SpeedDialMenu,
} from "@/components/ui"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"
import { EditFaction } from "@/components/factions"

interface ShowProperties {
  party: Party
}

type FormStateData = {
  entity: Party & {
    image?: File | null
  }
}

export default function Show({ party: initialParty }: ShowProperties) {
  const { subscribeToEntity } = useCampaign()
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
    const unsubscribe = subscribeToEntity("party", (data) => {
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
      <FormControl fullWidth margin="normal" error={!!errors.name}>
        <NameEditor
          entity={party}
          setEntity={setParty}
          updateEntity={updateEntity}
        />
        {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
      </FormControl>
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
    </Box>
  )
}
