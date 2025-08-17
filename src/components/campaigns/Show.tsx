"use client"

import { useCallback, useEffect } from "react"
import { FormControl, FormHelperText, Stack, Box } from "@mui/material"
import type { Campaign } from "@/types"
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

interface ShowProperties {
  campaign: Campaign
}

type FormStateData = {
  entity: Campaign & {
    image?: File | null
  }
}

export default function Show({ campaign: initialCampaign }: ShowProperties) {
  const { subscribeToEntity } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialCampaign,
  })
  const { status, errors } = formState
  const campaign = formState.data.entity

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    campaign,
    dispatchForm
  )

  const setCampaign = useCallback(
    (campaign: Campaign) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: campaign,
      })
    },
    [dispatchForm]
  )

  useEffect(() => {
    document.title = campaign.name ? `${campaign.name} - Chi War` : "Chi War"
  }, [campaign.name])

  // Subscribe to campaign updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("campaign", (data) => {
      if (data && data.id === initialCampaign.id) {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...data },
        })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialCampaign.id, dispatchForm])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage entity={campaign} setEntity={setCampaign} />
      <Alert status={status} />
      <FormControl fullWidth margin="normal" error={!!errors.name}>
        <NameEditor
          entity={campaign}
          setEntity={setCampaign}
          updateEntity={updateEntity}
        />
        {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
      </FormControl>
      <Box sx={{ mb: 2 }}>
        <SectionHeader
          title="Description"
          icon={<Icon keyword="Description" />}
          sx={{ mb: 2 }}
        >
          Description of this <InfoLink href="/campaigns" info="Campaign" />,
          including its premise, significance, and any notable events.
        </SectionHeader>
        <EditableRichText
          name="description"
          html={campaign.description}
          editable={true}
          onChange={handleChangeAndSave}
          fallback="No description available."
        />
      </Box>
      <Stack direction="column" spacing={2}>
        <Manager
          icon={<Icon keyword="User" size="24" />}
          parentEntity={campaign}
          childEntityName="User"
          title="Members"
          description={
            <>
              A <InfoLink href="/campaigns" info="Feng Shui Campaign" /> is a
              collection of adventures.
            </>
          }
          onListUpdate={updateEntity}
        />
      </Stack>
    </Box>
  )
}
