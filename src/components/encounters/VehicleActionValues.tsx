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
      direction="column"
      sx={{
        fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.75rem" },
        width: "100%",
        gap: { xs: 0.5, sm: 0.5 },
      }}
    >
      <Stack
        component="span"
        direction="row"
        flexWrap="wrap"
        sx={{
          gap: { xs: 0.75, sm: 1 },
          "& > span": {
            flexBasis: {
              xs: "calc(33.333% - 6px)", // 3 columns on mobile
              sm: "auto",
              md: "auto",
            },
            minWidth: { xs: "auto", sm: "auto" },
          },
        }}
      >
        <AV label="Acceleration" value={VS.acceleration(vehicle)} />
        <AV label="Handling" value={VS.handling(vehicle)} />
        <AV label="Squeal" value={VS.squeal(vehicle)} />
      </Stack>
      <Stack
        component="span"
        direction="row"
        flexWrap="wrap"
        sx={{
          gap: { xs: 0.75, sm: 1 },
          "& > span": {
            flexBasis: {
              xs: "calc(50% - 6px)", // 2 columns on mobile for second row
              sm: "auto",
              md: "auto",
            },
            minWidth: { xs: "auto", sm: "auto" },
          },
        }}
      >
        <AV label="Frame" value={VS.frame(vehicle)} />
        <AV label="Crunch" value={VS.crunch(vehicle)} />
      </Stack>
    </Stack>
  )
}
