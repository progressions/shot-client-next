"use client"

import { useCallback, useEffect } from "react"
import { FormControl, FormHelperText, Stack, Box } from "@mui/material"
import type { Site } from "@/types"
import { useCampaign } from "@/contexts"
import {
  Icon,
  InfoLink,
  Alert,
  NameEditor,
  EditableRichText,
  SectionHeader,
  HeroImage,
  SpeedDialMenu,
} from "@/components/ui"
import { CharacterManager } from "@/components/characters"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"
import { EditFaction } from "@/components/sites"

interface SitePageClientProperties {
  site: Site
}

type FormStateData = Site & {
  image?: File | null
}

export default function SitePageClient({
  site: initialSite,
}: SitePageClientProperties) {
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>(initialSite)
  const { status, errors } = formState
  const site = formState.data

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    site,
    dispatchForm
  )

  const setSite = useCallback(
    (site: Site) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: site,
      })
    },
    [dispatchForm]
  )

  useEffect(() => {
    document.title = site.name ? `${site.name} - Chi War` : "Chi War"
  }, [site.name])

  useEffect(() => {
    if (campaignData?.site && campaignData.site.id === initialSite.id) {
      setSite(campaignData.site)
    }
  }, [campaignData, initialSite, setSite])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage entity={site} setEntity={setSite} />
      <Alert status={status} />
      <FormControl fullWidth margin="normal" error={!!errors.name}>
        <NameEditor entity={site} setEntity={setSite} editable={true} />
        {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
      </FormControl>
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Faction"
          icon={<Icon keyword="Factions" />}
          sx={{ mb: 2 }}
        >
          The <InfoLink href="/factions" info="Faction" /> that controls this{" "}
          <InfoLink href="/sites" info="Feng Shui Site" />, which grants them{" "}
          access to its <InfoLink info="Chi" /> and other benefits.
        </SectionHeader>
        <Box sx={{ width: 400 }}>
          <EditFaction entity={site} updateEntity={updateEntity} />
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <SectionHeader
          title="Description"
          icon={<Icon keyword="Description" />}
          sx={{ mb: 2 }}
        >
          Description of this <InfoLink href="/sites" info="Feng Shui Site" />,
          including its history, significance, and any notable features.
        </SectionHeader>
        <EditableRichText
          name="Description"
          html={site.description}
          editable={true}
          onChange={handleChangeAndSave}
          fallback="No description available."
        />
      </Box>
      <Stack direction="column" spacing={2}>
        <CharacterManager
          icon={<Icon keyword="Characters" size="24" />}
          entity={site}
          title="Attuned Characters"
          description={
            <>
              A <InfoLink href="/sites" info="Feng Shui Site" /> is a location
              whose energy flow produces powerful <InfoLink info="Chi" /> for
              those <InfoLink info="Attuned" /> to it.{" "}
            </>
          }
          updateEntity={updateEntity}
        />
      </Stack>
    </Box>
  )
}
