"use client"

import VehicleForm from "./VehicleForm"

interface CreateVehicleFormProperties {
  open: boolean
  onClose: () => void
  onVehicleCreated?: () => void
}

export default function CreateVehicleForm({
  open,
  onClose,
  onVehicleCreated,
}: CreateVehicleFormProperties) {
  return (
    <VehicleForm
      open={open}
      onClose={onClose}
      title="New Vehicle"
      onVehicleCreated={onVehicleCreated}
    />
  )
}
