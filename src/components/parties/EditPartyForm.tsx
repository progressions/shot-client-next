"use client"

import { useClient } from "@/contexts"
import { type Party } from "@/types/types"
import PartyForm from "./PartyForm"

interface EditPartyFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedParty: Party) => void
  party: Party
}

export default function EditPartyForm({ open, onClose, onSave, party }: EditPartyFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, partyData: Party) => {
    const updatedPartyData = {
      ...party,
      id: party.id,
      name: partyData.name,
      description: partyData.description,
    } as Party
    formData.set("party", JSON.stringify(updatedPartyData))
    const response = await client.updateParty(party.id as string, formData)
    onSave(response.data)
  }

  return (
    <PartyForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ name: party.name || "", description: party.description || "", image: null }}
      title="Edit Party"
      existingImageUrl={party.image_url}
    />
  )
}

