"use client"

import { defaultCampaign, type Campaign } from "@/types"
import { useClient } from "@/contexts"
import CampaignForm from "./CampaignForm"

interface CreateCampaignFormProperties {
  open: boolean
  onClose: () => void
  onSave: (newCampaign: Campaign) => void
}

export default function CreateCampaignForm({
  open,
  onClose,
  onSave,
}: CreateCampaignFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, campaignData: Campaign) => {
    const campaign = { ...defaultCampaign, ...campaignData } as Campaign
    formData.set("campaign", JSON.stringify(campaign))
    const response = await client.createCampaign(formData)
    onSave(response.data)
  }

  return (
    <CampaignForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultCampaign, image: null }}
      title="New Campaign"
    />
  )
}
