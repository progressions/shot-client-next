"use client"

import { defaultJuncture, type Juncture } from "@/types"
import { useClient } from "@/contexts"
import JunctureForm from "./JunctureForm"

interface CreateJunctureFormProperties {
  open: boolean
  onClose: () => void
  onSave: (newJuncture: Juncture) => void
}

export default function CreateJunctureForm({
  open,
  onClose,
  onSave,
}: CreateJunctureFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, junctureData: Juncture) => {
    const juncture = { ...defaultJuncture, ...junctureData } as Juncture
    formData.set("juncture", JSON.stringify(juncture))
    const response = await client.createJuncture(formData)
    onSave(response.data)
  }

  return (
    <JunctureForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultJuncture, image: null }}
      title="New Juncture"
    />
  )
}
