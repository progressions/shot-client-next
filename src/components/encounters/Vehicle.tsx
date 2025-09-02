import { Stack, Box } from "@mui/material"
import type { Vehicle } from "@/types"
import { Actions, VehicleActionValues } from "@/components/encounters"

interface VehicleProps {
  vehicle: Vehicle
}

export default function Vehicle({ vehicle }: VehicleProps) {
  return (
    <Box
      component="span"
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.5, sm: 1 } }}
    >
      <VehicleActionValues vehicle={vehicle} />
      <Box component="span" sx={{ display: { xs: "flex", sm: "none" }, gap: 0.5, mt: 0.5 }}>
        <Actions entity={vehicle} />
      </Box>
    </Box>
  )
}
