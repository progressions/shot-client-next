"use client"

import { useClient } from "@/contexts"
import { type Schtick } from "@/types"
import SchtickForm from "./SchtickForm"

interface EditSchtickFormProperties {
  open: boolean
  onClose: () => void
  onSave: (updatedSchtick: Schtick) => void
  schtick: Schtick
}

export default function EditSchtickForm({
  open,
  onClose,
  onSave,
  schtick,
}: EditSchtickFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, schtickData: Schtick) => {
    const updatedSchtickData = {
      ...schtick,
      ...schtickData,
    } as Schtick
    console.log("updatedSchtickData", updatedSchtickData)
    formData.set("schtick", JSON.stringify(updatedSchtickData))
    const response = await client.updateSchtick(schtick.id, formData)
    onSave(response.data)
  }

  return (
    <SchtickForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...schtick, image: null }}
      title="Edit Schtick"
      existingImageUrl={schtick.image_url}
    />
  )
}
