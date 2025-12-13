"use client"

import { useCallback, useEffect, useRef } from "react"
import { FormControl, FormHelperText, Stack, Box } from "@mui/material"
import { type Campaign, isCampaignSeeding } from "@/types"
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
  SpeedDialMenu,
} from "@/components/ui"
import { EntityActiveToggle } from "@/components/common"
import {
  SeedingStatus,
  BatchImageGenerationButton,
  GrokCreditAlert,
} from "@/components/campaigns"
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
  const { subscribeToEntity, campaign: currentCampaign } = useCampaign()
  const { user } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialCampaign,
  })
  const { status, errors } = formState
  const campaign = formState.data.entity

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    campaign,
    dispatchForm
  )

  // Check permissions for administrative controls
  const hasAdminPermission =
    user?.admin ||
    (currentCampaign && user?.id === currentCampaign.gamemaster_id)

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

  // Use a ref to track current campaign for subscription merging
  const campaignRef = useRef(campaign)
  useEffect(() => {
    campaignRef.current = campaign
  }, [campaign])

  // Subscribe to campaign updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("campaign", data => {
      if (data && data.id === initialCampaign.id) {
        // Merge broadcast data with current campaign to preserve existing fields
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...campaignRef.current, ...data },
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
      {isCampaignSeeding(campaign) && (
        <SeedingStatus campaign={campaign} variant="banner" />
      )}
      <GrokCreditAlert campaign={campaign} />
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

      {hasAdminPermission && (
        <>
          <SectionHeader
            title="Administrative Controls"
            icon={<Icon keyword="Administration" />}
          >
            Manage the visibility and status of this campaign.
          </SectionHeader>
          <EntityActiveToggle
            entity={campaign}
            handleChangeAndSave={handleChangeAndSave}
          />
          <BatchImageGenerationButton campaign={campaign} />
        </>
      )}
    </Box>
  )
}
