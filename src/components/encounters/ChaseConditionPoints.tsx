"use client"

import { Box, Stack } from "@mui/material"
import type { Vehicle } from "@/types"
import { VS } from "@/services"
import { useTheme } from "@mui/material/styles"

interface ChaseConditionPointsProps {
  vehicle: Vehicle
}

export default function ChaseConditionPoints({
  vehicle,
}: ChaseConditionPointsProps) {
  const theme = useTheme()
  const chasePoints = VS.chasePoints(vehicle)
  const conditionPoints = VS.conditionPoints(vehicle)

  return (
    <Stack direction="column" spacing={1}>
      <Stack
        direction="column"
        sx={{
          backgroundColor: theme.palette.divider,
          width: { xs: "3.5rem", md: "4.5rem" },
          textAlign: "center",
          py: 1,
          borderRadius: "8px",
          alignItems: "center",
        }}
      >
        <Box
          sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" }, fontWeight: 800 }}
        >
          {chasePoints}
        </Box>
        <Box sx={{ fontSize: { xs: "0.75rem", md: "0.75rem" } }}>Chase</Box>
      </Stack>
      <Stack
        direction="column"
        sx={{
          backgroundColor: theme.palette.divider,
          width: { xs: "3.5rem", md: "4.5rem" },
          textAlign: "center",
          py: 1,
          borderRadius: "8px",
          alignItems: "center",
        }}
      >
        <Box
          sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" }, fontWeight: 800 }}
        >
          {conditionPoints}
        </Box>
        <Box sx={{ fontSize: { xs: "0.75rem", md: "0.75rem" } }}>Condition</Box>
      </Stack>
    </Stack>
  )
}
