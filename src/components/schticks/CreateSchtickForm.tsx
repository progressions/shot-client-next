"use client"

import { defaultSchtick, type Schtick } from "@/types"
import { useClient } from "@/contexts"
import SchtickForm from "./SchtickForm"

interface CreateSchtickFormProps {
  open: boolean
  onClose: () => void
  onSave: (newSchtick: Schtick) => void
}

export default function CreateSchtickForm({
  open,
  onClose,
  onSave,
}: CreateSchtickFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, schtickData: Schtick) => {
    const schtick = { ...defaultSchtick, ...schtickData } as Schtick
    formData.set("schtick", JSON.stringify(schtick))
    const response = await client.createSchtick(formData)
    onSave(response.data)
  }

  return (
    <SchtickForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultSchtick, image: null }}
      title="New Schtick"
    />
  )
}
