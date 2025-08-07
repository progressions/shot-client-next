import { Typography, Stack } from "@mui/material"
import { type Vehicle } from "@/types"
import { VehicleLink } from "@/components/ui"
import { VehicleAvatar } from "@/components/avatars"
import { VS } from "@/services"

type VehicleHeaderProps = {
  vehicle: Vehicle
}

export default function VehicleHeader({ vehicle }: VehicleHeaderProps) {
  const divider = VS.archetype(vehicle) && VS.faction(vehicle) ? " - " : ""
  return (
    <Stack direction="row" spacing={1} component="span">
      <VehicleAvatar vehicle={vehicle} />
      <Stack direction="column" spacing={0} component="span">
        <VehicleLink vehicle={vehicle} />
        <Typography
          variant="caption"
          sx={{ textTransform: "lowercase", fontVariant: "small-caps" }}
        >
          {VS.archetype(vehicle)}
          {divider}
          {VS.faction(vehicle)?.name}
        </Typography>
      </Stack>
    </Stack>
  )
}
