"use client"

import { useMemo } from "react"
import { Box } from "@mui/material"
import type { Vehicle, Character } from "@/types"
import { VS, CS } from "@/services"
import { useTheme } from "@mui/material/styles"
import { woundThresholds } from "@/services/SharedService"
import { CharacterTypes } from "@/types"

interface ChaseConditionPointsProps {
  vehicle: Vehicle
  driver?: Character
}

export default function ChaseConditionPoints({
  vehicle,
  driver,
}: ChaseConditionPointsProps) {
  const theme = useTheme()
  const chasePoints = VS.chasePoints(vehicle)
  const conditionPoints = VS.conditionPoints(vehicle)
  
  // Determine the wound threshold based on the driver's type
  const woundThreshold = useMemo(() => {
    if (driver) {
      const driverType = CS.type(driver)
      const thresholds = woundThresholds[driverType as CharacterTypes]
      return thresholds?.serious || 35
    }
    // Fallback to vehicle's method if no driver provided
    return VS.getDefeatThreshold(vehicle)
  }, [driver, vehicle])
  
  const chaseExceedsThreshold = chasePoints >= woundThreshold
  const conditionExceedsThreshold = conditionPoints >= woundThreshold

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
          backgroundColor: chaseExceedsThreshold
            ? theme.palette.error.dark
            : theme.palette.divider,
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
            color: chaseExceedsThreshold
              ? theme.palette.error.contrastText
              : "inherit",
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
            color: chaseExceedsThreshold
              ? theme.palette.error.contrastText
              : "inherit",
          }}
        >
          Chase
        </Box>
      </Box>
      <Box
        component="span"
        sx={{
          backgroundColor: conditionExceedsThreshold
            ? theme.palette.error.dark
            : theme.palette.divider,
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
            color: conditionExceedsThreshold
              ? theme.palette.error.contrastText
              : "inherit",
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
            color: conditionExceedsThreshold
              ? theme.palette.error.contrastText
              : "inherit",
          }}
        >
          Cond
        </Box>
      </Box>
    </Box>
  )
}
