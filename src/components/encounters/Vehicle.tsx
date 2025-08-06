import { Stack } from "@mui/material"
import type { Vehicle } from "@/types"
import { Actions, VehicleActionValues } from "@/components/encounters"

interface VehicleProps {
  vehicle: Vehicle
}

export default function Vehicle({ vehicle }: VehicleProps) {
  return (
    <Stack component="span" direction="row" spacing={1}>
      <Stack
        component="span"
        direction="column"
        spacing={1}
        sx={{ flexGrow: 1 }}
      >
        <VehicleActionValues vehicle={vehicle} />
      </Stack>
      <Actions entity={vehicle} />
    </Stack>
  )
}
