"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  FormControl,
  FormHelperText,
  Stack,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material"
import { type Campaign, type AiProvider, isCampaignSeeding } from "@/types"
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
import { EntityActiveToggle, EntityAtAGlanceToggle } from "@/components/common"
import {
  SeedingStatus,
  BatchImageGenerationButton,
  AiCreditAlert,
  AiProviderSelector,
} from "@/components/campaigns"
import { CampaignInvitations } from "@/components/invitations"
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
  const {
    subscribeToEntity,
    campaign: currentCampaign,
    updateCampaign,
  } = useCampaign()
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

  // Local state for AI toggle to control visual state during async operations
  const [aiToggleValue, setAiToggleValue] = useState(
    campaign.ai_generation_enabled !== false
  )

  // Sync local toggle state when campaign changes (e.g., from API or broadcast)
  useEffect(() => {
    setAiToggleValue(campaign.ai_generation_enabled !== false)
  }, [campaign.ai_generation_enabled])

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

  // Handle AI provider change
  const handleProviderChange = useCallback(
    (provider: AiProvider | null) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: { ...campaign, ai_provider: provider },
      })
      updateCampaign({ ai_provider: provider })
    },
    [campaign, dispatchForm, updateCampaign]
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
      <AiCreditAlert campaign={campaign} />
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

      {hasAdminPermission && <CampaignInvitations />}

      {hasAdminPermission && (
        <>
          <SectionHeader title="AI Integrations" icon={<Icon keyword="AI" />}>
            Configure AI-powered features and external integrations for this
            campaign.
          </SectionHeader>
          <Box sx={{ my: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={aiToggleValue}
                  onChange={async e => {
                    const newValue = e.target.checked
                    const previousValue = aiToggleValue
                    // Optimistically update local state for immediate visual feedback
                    setAiToggleValue(newValue)
                    try {
                      await handleChangeAndSave({
                        target: {
                          name: "ai_generation_enabled",
                          value: newValue,
                        },
                      })
                      // Update global campaign context after successful API save
                      updateCampaign({ ai_generation_enabled: newValue })
                    } catch (error) {
                      // API save failed, revert to previous state
                      setAiToggleValue(previousValue)
                      console.error(
                        "Failed to save AI generation toggle:",
                        error
                      )
                    }
                  }}
                />
              }
              label="AI Generation"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4.5 }}>
              Allow AI-powered character and image generation. When disabled,
              Generate buttons and Extend options are hidden from the UI.
            </Typography>
          </Box>
          <AiProviderSelector
            campaign={campaign}
            onProviderChange={handleProviderChange}
          />
          <BatchImageGenerationButton campaign={campaign} />

          <SectionHeader
            title="Administrative Controls"
            icon={<Icon keyword="Administration" />}
            sx={{ mt: 3 }}
          >
            Manage the visibility and status of this campaign.
          </SectionHeader>
          <Stack direction="row" spacing={3} sx={{ my: 1, flexWrap: "wrap" }}>
            <EntityActiveToggle
              entity={campaign}
              handleChangeAndSave={handleChangeAndSave}
            />
            <EntityAtAGlanceToggle
              entity={campaign}
              handleChangeAndSave={handleChangeAndSave}
            />
          </Stack>
        </>
      )}
    </Box>
  )
}
