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
          <Typography variant="subtitle1" fontWeight="bold">
            {showLink ? (
              <VehicleLink vehicle={vehicle}>{vehicle.name}</VehicleLink>
            ) : (
              vehicle.name
            )}
          </Typography>
        </Stack>

        {/* Vehicle Stats */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            <strong>Acceleration</strong> {VS.acceleration(vehicle)} •{" "}
            <strong>Handling</strong> {VS.handling(vehicle)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            <strong>Squeal</strong> {VS.squeal(vehicle)} •{" "}
            <strong>Frame</strong> {VS.frame(vehicle)} • <strong>Crunch</strong>{" "}
            {VS.crunch(vehicle)}
          </Typography>
        </Box>

        {/* Chase and Condition Points */}
        <Box sx={{ mt: 1 }}>
          <ChaseConditionPoints vehicle={vehicle} />
        </Box>
      </Box>
    </Stack>
  )
}
