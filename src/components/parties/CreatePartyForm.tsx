"use client"

import { defaultParty, type Party } from "@/types"
import { useClient } from "@/contexts"
import PartyForm from "./PartyForm"

interface CreatePartyFormProps {
  open: boolean
  onClose: () => void
  onSave: (newParty: Party) => void
}

export default function CreatePartyForm({ open, onClose, onSave }: CreatePartyFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, partyData: Party) => {
    const party = { ...defaultParty, ...partyData } as Party
    formData.set("party", JSON.stringify(party))
    const response = await client.createParty(formData)
    onSave(response.data)
  }

  return (
    <PartyForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultParty, image: null }}
      title="New Party"
    />
  )
}

