import { Stack } from "@mui/material"
import type { Shot, Vehicle } from "@/types"
import { Actions, VehicleActionValues } from "@/components/encounters"
import { useEncounter } from "@/contexts"

interface VehicleProps {
  shot: Shot
  vehicle: Vehicle
}

export default function Vehicle({ shot, vehicle }: VehicleProps) {
  const { encounterState } = useEncounter()

  const handleClick = () => {}

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
