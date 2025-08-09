"use client"

import { defaultVehicle, type Vehicle } from "@/types"
import { useClient } from "@/contexts"
import VehicleForm from "./VehicleForm"

interface CreateVehicleFormProperties {
  open: boolean
  onClose: () => void
  onSave: (newVehicle: Vehicle) => void
}

export default function CreateVehicleForm({
  open,
  onClose,
  onSave,
}: CreateVehicleFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, vehicleData: Vehicle) => {
    const vehicle = { ...defaultVehicle, ...vehicleData } as Vehicle
    formData.set("vehicle", JSON.stringify(vehicle))
    const response = await client.createVehicle(formData)
    onSave(response.data)
  }

  const defaultEntity = defaultVehicle

  return (
    <VehicleForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultEntity, image: null }}
      title="New Vehicle"
    />
  )
}
