"use client"

import { defaultFaction, type Faction } from "@/types"
import { useClient } from "@/contexts"
import FactionForm from "./FactionForm"

interface CreateFactionFormProps {
  open: boolean
  onClose: () => void
  onSave: (newFaction: Faction) => void
}

export default function CreateFactionForm({
  open,
  onClose,
  onSave,
}: CreateFactionFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, factionData: Faction) => {
    const faction = { ...defaultFaction, ...factionData } as Faction
    formData.set("faction", JSON.stringify(faction))
    const response = await client.createFaction(formData)
    onSave(response.data)
  }

  return (
    <FactionForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultFaction, image: null }}
      title="New Faction"
    />
  )
}
