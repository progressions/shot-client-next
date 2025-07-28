"use client"

import { useClient } from "@/contexts"
import { type Juncture } from "@/types/types"
import JunctureForm from "./JunctureForm"

interface EditJunctureFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedJuncture: Juncture) => void
  juncture: Juncture
}

export default function EditJunctureForm({ open, onClose, onSave, juncture }: EditJunctureFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, junctureData: Juncture) => {
    const updatedJunctureData = {
      ...juncture,
      ...junctureData,
    } as Juncture
    formData.set("juncture", JSON.stringify(updatedJunctureData))
    const response = await client.updateJuncture(juncture.id as string, formData)
    onSave(response.data)
  }

  return (
    <JunctureForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...juncture, image: null }}
      title="Edit Juncture"
      existingImageUrl={juncture.image_url}
    />
  )
}

