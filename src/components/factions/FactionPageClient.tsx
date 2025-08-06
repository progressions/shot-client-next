"use client"

import { useEffect } from "react"
import { Stack, Box } from "@mui/material"
import type { Faction } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { JuncturesList, SitesList, PartiesList } from "@/components/factions"
import { InfoLink, NameEditor, HeroImage, SpeedDialMenu } from "@/components/ui"
import { CharacterManager } from "@/components/characters"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"

interface FactionPageClientProperties {
  faction: Faction
}

type FormStateData = Faction & {
  image?: File | null
}

export default function FactionPageClient({
  faction: initialFaction,
}: FactionPageClientProperties) {
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>(initialFaction)
  const faction = formState.data

  const { updateEntity, deleteEntity } = useEntity(faction, dispatchForm)

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
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={faction.description}
          html={faction.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>

      <Stack direction="column" spacing={2}>
        <CharacterManager
          name="faction"
          title="Attuned Characters"
          entity={faction}
          description={
            <>
              A <InfoLink href="/factions" info="Faction" /> recruits{" "}
              <InfoLink href="/characters" info="Characters" /> to join its
              cause, acting as a unified force in the world of the{" "}
              <InfoLink info="Chi War" />.
            </>
          }
          updateEntity={updateEntity}
        />
        <PartiesList entity={faction} updateEntity={updateEntity} />
        <SitesList entity={faction} updateEntity={updateEntity} />
        <JuncturesList entity={faction} updateEntity={updateEntity} />
      </Stack>
    </Box>
  )
}
