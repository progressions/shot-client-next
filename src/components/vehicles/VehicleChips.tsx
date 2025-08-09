import { Chipset } from "@/components/ui"
import { Chip } from "@mui/material"
import type { Vehicle } from "@/types"

type VehicleChipsProps = {
  vehicle: Vehicle
}

export default function VehicleChips({ vehicle }: VehicleChipsProps) {
  return (
    <Chipset>
      {vehicle.created_at && (
        <Chip
          label={`Created: ${new Date(vehicle.created_at).toLocaleDateString()}`}
          size="small"
          color="warning"
        />
      )}
    </Chipset>
  )
}
