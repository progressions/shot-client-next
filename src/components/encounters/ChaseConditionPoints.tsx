"use client"

import { Box } from "@mui/material"
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
  
  console.log("ChaseConditionPoints - Vehicle data:", {
    name: vehicle.name,
    chasePoints,
    conditionPoints,
    was_rammed_or_damaged: vehicle.was_rammed_or_damaged,
    is_defeated_in_chase: vehicle.is_defeated_in_chase,
    defeat_type: vehicle.defeat_type,
    defeat_threshold: vehicle.defeat_threshold,
    isDefeated: VS.isDefeated(vehicle),
    defeatType: VS.getDefeatType(vehicle),
  })

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        gap: { xs: 0.5, sm: 1 },
        alignItems: "center",
        m: 0,
        p: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          backgroundColor: theme.palette.divider,
          width: { xs: "2.25rem", sm: "3rem", md: "3.5rem" },
          height: { xs: "2.25rem", sm: "3rem", md: "auto" },
          borderRadius: { xs: "50%", sm: "50%", md: "8px" },
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: { xs: 0, md: 0.75 },
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            fontWeight: 800,
            lineHeight: 1,
            display: "block",
          }}
        >
          {chasePoints}
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: { xs: "0.4rem", sm: "0.5rem", md: "0.65rem" },
            lineHeight: 1,
            mt: { xs: 0, md: 0.25 },
            display: "block",
          }}
        >
          Chase
        </Box>
      </Box>
      <Box
        component="span"
        sx={{
          backgroundColor: theme.palette.divider,
          width: { xs: "2.25rem", sm: "3rem", md: "3.5rem" },
          height: { xs: "2.25rem", sm: "3rem", md: "auto" },
          borderRadius: { xs: "50%", sm: "50%", md: "8px" },
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: { xs: 0, md: 0.75 },
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            fontWeight: 800,
            lineHeight: 1,
            display: "block",
          }}
        >
          {conditionPoints}
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: { xs: "0.4rem", sm: "0.5rem", md: "0.65rem" },
            lineHeight: 1,
            mt: { xs: 0, md: 0.25 },
            display: "block",
          }}
        >
          Cond
        </Box>
      </Box>
    </Box>
  )
}
