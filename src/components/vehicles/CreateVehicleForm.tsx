"use client"

import VehicleForm from "./VehicleForm"

interface CreateVehicleFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreateVehicleForm({
  open,
  onClose,
}: CreateVehicleFormProperties) {
  return (
    <VehicleForm
      open={open}
      onClose={onClose}
      title="New Vehicle"
    />
  )
}
