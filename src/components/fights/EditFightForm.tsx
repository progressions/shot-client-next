"use client"

import { useClient } from "@/contexts"
import { type Fight } from "@/types"
import FightForm from "./FightForm"

interface EditFightFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedFight: Fight) => void
  fight: Fight
}

export default function EditFightForm({
  open,
  onClose,
  onSave,
  fight,
}: EditFightFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, fightData: Fight) => {
    const updatedFightData = {
      id: fight.id,
      name: fightData.name,
      description: fightData.description,
      active: fight.active,
      created_at: fight.created_at,
    } as Fight
    formData.set("fight", JSON.stringify(updatedFightData))
    const response = await client.updateFight(fight.id, formData)
    onSave(response.data)
  }

  return (
    <FightForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{
        name: fight.name || "",
        description: fight.description || "",
        image: null,
      }}
      title="Edit Fight"
      existingImageUrl={fight.image_url}
    />
  )
}
