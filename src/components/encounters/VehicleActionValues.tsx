import type { Vehicle } from "@/types"
import { VS } from "@/services"
import { Stack } from "@mui/material"
import { AV } from "@/components/ui/"

interface VehicleActionValuesProps {
  vehicle: Vehicle
}

export default function VehicleActionValues({
  vehicle,
}: VehicleActionValuesProps) {
  return (
    <Stack
      component="span"
      direction="row"
      flexWrap="wrap"
      rowGap={0}
      columnGap={1}
      sx={{
        fontSize: { xs: "0.75rem", md: "0.75rem" },
        width: { xs: "100%", md: "300px" },
      }}
    >
      <AV label="Acceleration" value={VS.acceleration(vehicle)} />
      <AV label="Handling" value={VS.handling(vehicle)} />
      <AV label="Squeal" value={VS.squeal(vehicle)} />
      <AV label="Frame" value={VS.frame(vehicle)} />
      <AV label="Crunch" value={VS.crunch(vehicle)} />
    </Stack>
  )
}
