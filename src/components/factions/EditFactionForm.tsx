"use client"

import { useClient } from "@/contexts"
import { type Faction } from "@/types"
import FactionForm from "./FactionForm"

interface EditFactionFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedFaction: Faction) => void
  faction: Faction
}

export default function EditFactionForm({
  open,
  onClose,
  onSave,
  faction,
}: EditFactionFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, factionData: Faction) => {
    const updatedFactionData = {
      ...faction,
      ...factionData,
    } as Faction

    formData.set("faction", JSON.stringify(updatedFactionData))
    const response = await client.updateFaction(faction.id, formData)
    onSave(response.data)
  }

  return (
    <FactionForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...faction, image: null }}
      title="Edit Faction"
      existingImageUrl={faction.image_url}
    />
  )
}
