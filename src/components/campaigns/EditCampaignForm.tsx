"use client"

import { useClient } from "@/contexts"
import { type Campaign } from "@/types"
import CampaignForm from "./CampaignForm"

interface EditCampaignFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedCampaign: Campaign) => void
  campaign: Campaign
}

export default function EditCampaignForm({
  open,
  onClose,
  onSave,
  campaign,
}: EditCampaignFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, campaignData: Campaign) => {
    const updatedCampaignData = {
      ...campaign,
      id: campaign.id,
      name: campaignData.name,
      description: campaignData.description,
    } as Campaign
    formData.set("campaign", JSON.stringify(updatedCampaignData))
    const response = await client.updateCampaign(campaign.id, formData)
    onSave(response.data)
  }

  return (
    <CampaignForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...campaign, image: null }}
      title="Edit Campaign"
      existingImageUrl={campaign.image_url}
    />
  )
}
