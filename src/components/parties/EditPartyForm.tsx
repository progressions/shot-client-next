"use client"

import { useClient } from "@/contexts"
import { type Party } from "@/types"
import PartyForm from "./PartyForm"

interface EditPartyFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedParty: Party) => void
  party: Party
}

export default function EditPartyForm({
  open,
  onClose,
  onSave,
  party,
}: EditPartyFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, partyData: Party) => {
    const updatedPartyData = {
      ...party,
      ...partyData,
    } as Party

    formData.set("party", JSON.stringify(updatedPartyData))
    const response = await client.updateParty(party.id, formData)
    onSave(response.data)
  }

  return (
    <PartyForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...party, image: null }}
      title="Edit Party"
      existingImageUrl={party.image_url}
    />
  )
}
