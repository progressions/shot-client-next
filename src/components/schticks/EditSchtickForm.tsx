"use client"

import { useClient } from "@/contexts"
import { type Schtick } from "@/types/types"
import SchtickForm from "./SchtickForm"

interface EditSchtickFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedSchtick: Schtick) => void
  schtick: Schtick
}

export default function EditSchtickForm({ open, onClose, onSave, schtick }: EditSchtickFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, schtickData: Schtick) => {
    const updatedSchtickData = {
      ...schtick,
      id: schtick.id,
      name: schtickData.name,
      description: schtickData.description,
    } as Schtick
    formData.set("schtick", JSON.stringify(updatedSchtickData))
    const response = await client.updateSchtick(schtick.id as string, formData)
    onSave(response.data)
  }

  return (
    <SchtickForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ name: schtick.name || "", description: schtick.description || "", image: null }}
      title="Edit Schtick"
      existingImageUrl={schtick.image_url}
    />
  )
}

