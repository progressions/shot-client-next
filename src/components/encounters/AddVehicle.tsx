"use client"

import { useState } from "react"
import { Stack } from "@mui/material"
import { VehicleFilter } from "@/components/vehicles"
import { type Vehicle } from "@/types"
import { useEncounter, useToast, useClient } from "@/contexts"

export default function AddVehicle({
  open: _open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const handleSetSelectedVehicle = (vehicle: Vehicle | null) => {
    console.log(
      "[AddVehicle] Setting selected vehicle to:",
      vehicle?.name || "null"
    )
    setSelectedVehicle(vehicle)
  }

  const handleAddMember = async (vehicle: Vehicle) => {
    console.log("[AddVehicle] handleAddMember called with:", vehicle)
    if (!vehicle || !encounter) {
      console.log("Missing vehicle or encounter", { vehicle, encounter })
      return
    }

    try {
      console.log("Adding vehicle to fight:", vehicle.name)
      await client.addVehicle(encounter, vehicle)
      toastSuccess(`Added ${vehicle.name} to the fight`)
      setSelectedVehicle(null)
      onClose()
    } catch (error) {
      console.error("Error adding vehicle to fight:", error)
      toastError(`Failed to add ${vehicle.name} to the fight`)
    }
  }

  // Debug logging
  console.log("[AddVehicle] Current selectedVehicle:", selectedVehicle)

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
    >
      <VehicleFilter
        value={selectedVehicle?.id || null}
        setSelectedVehicle={handleSetSelectedVehicle}
        addMember={handleAddMember}
        omit={["search"]}
      />
    </Stack>
  )
}
