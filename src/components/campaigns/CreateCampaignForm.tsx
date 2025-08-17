"use client"

import CampaignForm from "./CampaignForm"

interface CreateCampaignFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreateCampaignForm({
  open,
  onClose,
}: CreateCampaignFormProperties) {
  return (
    <CampaignForm
      open={open}
      onClose={onClose}
      title="New Campaign"
    />
  )
}
