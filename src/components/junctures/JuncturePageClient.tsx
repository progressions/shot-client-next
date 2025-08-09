"use client"

import { useCallback, useEffect } from "react"
import { Stack, Box } from "@mui/material"
import type { Juncture } from "@/types"
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
import { EditFaction } from "@/components/factions"
import { FormActions, useForm } from "@/reducers"

interface JuncturePageClientProperties {
  juncture: Juncture
}

type FormStateData = {
  entity: Juncture & {
    image?: File | null
  }
}

export default function JuncturePageClient({
  juncture: initialJuncture,
}: JuncturePageClientProperties) {
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({ entity: initialJuncture })
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

  useEffect(() => {
    if (
      campaignData?.juncture &&
      campaignData.juncture.id === initialJuncture.id
    ) {
      setJuncture(campaignData.juncture)
    }
  }, [campaignData, initialJuncture, setJuncture])

  console.log("juncture.faction_id", juncture.faction_id)

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage entity={juncture} setEntity={setJuncture} />
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
        <CharacterManager
          icon={<Icon keyword="Fighters" />}
          name="juncture"
          title="Juncture Natives"
          entity={juncture}
          description={
            <>
              <InfoLink href="/characters" info="Characters" /> born into a
              specific <InfoLink href="/junctures" info="Juncture" /> often
              travel through the <InfoLink info="Netherworld" />, participating
              in the <InfoLink info="Chi War" />, enaging in its conflicts and
              shaping its outcomes.
            </>
          }
          updateParent={updateEntity}
        />
      </Stack>
    </Box>
  )
}
