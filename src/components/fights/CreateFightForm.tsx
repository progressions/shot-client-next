"use client"

import { defaultFight, type Fight } from "@/types"
import { useClient } from "@/contexts"
import FightForm from "./FightForm"

interface CreateFightFormProps {
  open: boolean
  onClose: () => void
  onSave: (newFight: Fight) => void
}

export default function CreateFightForm({ open, onClose, onSave }: CreateFightFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, fightData: Fight) => {
    const fight = { ...defaultFight, ...fightData } as Fight
    formData.set("fight", JSON.stringify(fight))
    const response = await client.createFight(formData)
    onSave(response.data)
  }

  return (
    <FightForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ name: "", description: "", image: null }}
      title="New Fight"
    />
  )
}
