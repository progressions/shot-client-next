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
    <Stack 
      direction={{ xs: "row", sm: "column" }} 
      spacing={{ xs: 0.5, sm: 1 }}
      sx={{ alignItems: "center" }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.divider,
          width: { xs: "2.25rem", sm: "3rem", md: "3.5rem" },
          height: { xs: "2.25rem", sm: "3rem", md: "auto" },
          borderRadius: { xs: "50%", sm: "50%", md: "8px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: { xs: 0, md: 0.75 },
        }}
      >
        <Box
          sx={{ 
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" }, 
            fontWeight: 800,
            lineHeight: 1
          }}
        >
          {chasePoints}
        </Box>
        <Box sx={{ 
          fontSize: { xs: "0.4rem", sm: "0.5rem", md: "0.65rem" },
          lineHeight: 1,
          mt: { xs: 0, md: 0.25 }
        }}>
          Chase
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: theme.palette.divider,
          width: { xs: "2.25rem", sm: "3rem", md: "3.5rem" },
          height: { xs: "2.25rem", sm: "3rem", md: "auto" },
          borderRadius: { xs: "50%", sm: "50%", md: "8px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: { xs: 0, md: 0.75 },
        }}
      >
        <Box
          sx={{ 
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" }, 
            fontWeight: 800,
            lineHeight: 1
          }}
        >
          {conditionPoints}
        </Box>
        <Box sx={{ 
          fontSize: { xs: "0.4rem", sm: "0.5rem", md: "0.65rem" },
          lineHeight: 1,
          mt: { xs: 0, md: 0.25 }
        }}>
          Cond
        </Box>
      </Box>
    </Stack>
  )
}
