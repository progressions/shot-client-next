"use client"

import { useCallback, useEffect } from "react"
import { FormControl, FormHelperText, Stack, Box } from "@mui/material"
import type { Site } from "@/types"
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
import { SiteSpeedDial } from "@/components/sites"
import {
  EntityActiveToggle,
  EntityAtAGlanceToggle,
  NotionSyncButton,
  EditEntityNotionLink,
} from "@/components/common"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"
import { EditFaction } from "@/components/factions"

interface ShowProperties {
  site: Site
}

type FormStateData = {
  entity: Site & {
    image?: File | null
  }
}

export default function Show({ site: initialSite }: ShowProperties) {
  const { subscribeToEntity, campaign } = useCampaign()
  const { user } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialSite,
  })
  const { status, errors } = formState
  const site = formState.data.entity

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    site,
    dispatchForm
  )

  // Check permissions for administrative controls
  const hasAdminPermission =
    user?.admin || (campaign && user?.id === campaign.gamemaster_id)

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

  // Subscribe to site updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("site", data => {
      if (data && data.id === initialSite.id) {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...data },
        })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialSite.id, dispatchForm])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SiteSpeedDial site={site} onDelete={deleteEntity} />
      <HeroImage entity={site} setEntity={setSite} />
      <Alert status={status} />
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ my: 1, flexWrap: "wrap" }}
      >
        <FormControl error={!!errors.name} sx={{ flexGrow: 1 }}>
          <NameEditor
            entity={site}
            setEntity={setSite}
            updateEntity={updateEntity}
          />
          {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
        </FormControl>
        <EditEntityNotionLink
          entity={site}
          entityType="site"
          updateEntity={setSite}
        />
      </Stack>
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
          name="description"
          html={site.description}
          editable={true}
          onChange={handleChangeAndSave}
          fallback="No description available."
        />
      </Box>
      <Stack direction="column" spacing={2}>
        <Manager
          icon={<Icon keyword="Characters" size="24" />}
          parentEntity={site}
          childEntityName="Character"
          title="Attuned Characters"
          description={
            <>
              A <InfoLink href="/sites" info="Feng Shui Site" /> is a location
              whose energy flow produces powerful <InfoLink info="Chi" /> for
              those <InfoLink info="Attuned" /> to it.{" "}
            </>
          }
          onListUpdate={updateEntity}
        />
      </Stack>

      {hasAdminPermission && (
        <>
          <SectionHeader
            title="Administrative Controls"
            icon={<Icon keyword="Administration" />}
          >
            Manage the visibility and status of this site.
          </SectionHeader>
          <Stack direction="column" spacing={2} sx={{ my: 2 }}>
            <EntityActiveToggle
              entity={site}
              handleChangeAndSave={handleChangeAndSave}
            />
            <EntityAtAGlanceToggle
              entity={site}
              handleChangeAndSave={handleChangeAndSave}
            />
            <NotionSyncButton
              entity={site}
              entityType="site"
              onSync={setSite}
            />
          </Stack>
        </>
      )}
    </Box>
  )
}
