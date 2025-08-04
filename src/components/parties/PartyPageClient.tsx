"use client"

import { VscGithubAction } from "react-icons/vsc"
import { GiSwordman } from "react-icons/gi"
import { useState, useEffect } from "react"
import { Stack, Box } from "@mui/material"
import type { Party } from "@/types"
import { useCampaign } from "@/contexts"
import {
  HeroImage,
  SpeedDialMenu,
  SectionHeader,
  EditableRichText,
  NameEditor,
} from "@/components/ui"
import { CharacterManager } from "@/components/characters"
import { InfoLink } from "@/components/links"
import { useEntity } from "@/hooks"
import { FactionAutocomplete } from "@/components/autocomplete"

interface PartyPageClientProperties {
  party: Party
}

export default function PartyPageClient({
  party: initialParty,
}: PartyPageClientProperties) {
  const { campaignData } = useCampaign()

  const [party, setParty] = useState<Party>(initialParty)
  const {
    updateEntity: updateParty,
    deleteEntity: deleteParty,
    handleChange,
  } = useEntity(party, setParty)

  useEffect(() => {
    document.title = party.name ? `${party.name} - Chi War` : "Chi War"
  }, [party.name])

  useEffect(() => {
    if (campaignData?.party && campaignData.party.id === initialParty.id) {
      setParty(campaignData.party)
    }
  }, [campaignData, initialParty])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteParty} />
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
          updateEntity={updateParty}
        />
      </Box>
      <HeroImage entity={party} setEntity={setParty} />
      <Box sx={{ mb: 2 }}>
        <SectionHeader title="Faction" icon={<VscGithubAction size="24" />}>
          A Party belongs to a Faction, which governs its aims and objectives.
        </SectionHeader>
        <Box sx={{ mt: 4 }}>
          <FactionAutocomplete
            value={party.faction_id}
            onChange={faction =>
              handleChange({
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
          icon={<VscGithubAction size="24" />}
        />
        <EditableRichText
          name="description"
          html={party.description}
          editable={true}
          onChange={handleChange}
          fallback="No description available."
        />
      </Box>

      <Stack direction="column" spacing={2}>
        <CharacterManager
          icon={<GiSwordman size="24" />}
          name="party"
          title="Party Members"
          description={
            <>
              A <InfoLink href="/parties" info="Party" /> consists of{" "}
              <InfoLink href="/characters" info="Characters" /> who work
              together for a <InfoLink href="/factions" info="Faction" />.
            </>
          }
          entity={party}
          update={updateParty}
          setEntity={setParty}
        />
      </Stack>
    </Box>
  )
}
