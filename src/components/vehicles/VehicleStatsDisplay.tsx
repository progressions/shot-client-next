"use client"

import { Box, Typography, Stack } from "@mui/material"
import { VS } from "@/services"
import type { Vehicle } from "@/types"
import Avatar from "@/components/avatars/Avatar"
import { VehicleLink } from "@/components/ui/links"
import ChaseConditionPoints from "@/components/encounters/ChaseConditionPoints"

interface VehicleStatsDisplayProps {
  vehicle: Vehicle
  showLink?: boolean
}

export default function VehicleStatsDisplay({
  vehicle,
  showLink = true,
}: VehicleStatsDisplayProps) {
  return (
    <Stack direction="row" spacing={2}>
      <Avatar entity={vehicle} sx={{ width: 64, height: 64 }} />
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {showLink ? (
              <VehicleLink vehicle={vehicle}>{vehicle.name}</VehicleLink>
            ) : (
              vehicle.name
            )}
          </Typography>
        </Stack>

        {/* Vehicle Stats Row 1 */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          <strong>Acceleration</strong> {VS.acceleration(vehicle)} •{" "}
          <strong>Handling</strong> {VS.handling(vehicle)} •{" "}
          <strong>Squeal</strong> {VS.squeal(vehicle)}
        </Typography>

        {/* Vehicle Stats Row 2 */}
        <Typography variant="body2" color="text.secondary">
          <strong>Frame</strong> {VS.frame(vehicle)} • <strong>Crunch</strong>{" "}
          {VS.crunch(vehicle)}
        </Typography>

        {/* Chase and Condition Points */}
        <Box sx={{ mt: 1 }}>
          <ChaseConditionPoints vehicle={vehicle} />
        </Box>
      </Box>
    </Stack>
  )
}
