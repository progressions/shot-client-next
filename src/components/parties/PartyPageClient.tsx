"use client"

import { useEffect } from "react"
import { Stack, Box } from "@mui/material"
import type { Party } from "@/types"
import { useCampaign } from "@/contexts"
import {
  HeroImage,
  SpeedDialMenu,
  SectionHeader,
  EditableRichText,
  NameEditor,
  InfoLink,
  Icon,
} from "@/components/ui"
import { CharacterManager } from "@/components/characters"
import { useEntity } from "@/hooks"
import { FactionAutocomplete } from "@/components/autocomplete"
import { FormActions, useForm } from "@/reducers"

interface PartyPageClientProperties {
  party: Party
}

type FormStateData = Party & {
  image?: File | null
}

export default function PartyPageClient({
  party: initialParty,
}: PartyPageClientProperties) {
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>(initialParty)
  const party = formState.data

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    party,
    dispatchForm
  )

  const setParty = useCallback(
    (party: Party) => {
      dispatchForm({
        type: FormActions.EDIT,
        name: "data",
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
          A Party belongs to a Faction, which governs its aims and objectives.
        </SectionHeader>
        <Box sx={{ width: 400, mt: 3, mb: 4 }}>
          <FactionAutocomplete
            value={party.faction_id}
            onChange={faction =>
              handleChangeAndSave({
                target: { name: "faction_id", value: faction?.id || "" },
              })
            }
            allowNone={true}
          />
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
        <CharacterManager
          icon={<Icon keyword="Fighters" />}
          name="party"
          title="Party Members"
          entity={party}
          description={
            <>
              A <InfoLink href="/parties" info="Party" /> consists of{" "}
              <InfoLink href="/characters" info="Characters" /> who work
              together for a <InfoLink href="/factions" info="Faction" />.
            </>
          }
          updateEntity={updateEntity}
        />
      </Stack>
    </Box>
  )
}
