"use client"

import { useState } from "react"
import { Stack } from "@mui/material"
import { AddButton, DialogBox } from "@/components/ui"
import { VehicleFilter } from "@/components/vehicles"
import { type Entity } from "@/types"
import { useEncounter } from "@/contexts"

type AddVehicleProps = {
  open?: boolean
  onClose?: () => void
}

export default function AddVehicle({ open = false, onClose }: AddVehicleProps) {
  const { encounter, updateEncounter } = useEncounter()
  const [entity, setEntity] = useState<Entity | null>(null)

  const handleAdd = async () => {
    console.log("about to add", entity)
    const updatedEncounter = {
      ...encounter,
      vehicle_ids: [...encounter.vehicle_ids, entity!.id],
    }
    await updateEncounter(updatedEncounter)
    setEntity(null)
  }

  return (
    <DialogBox open={open} onClose={onClose}>
      <Stack
        sx={{ width: 740 }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <VehicleFilter setEntity={setEntity} />
        <AddButton onClick={handleAdd} disabled={!entity} />
      </Stack>
    </DialogBox>
  )
}
