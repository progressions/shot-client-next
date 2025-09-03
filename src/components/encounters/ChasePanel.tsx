"use client"

import { useMemo, useEffect, useState } from "react"
import { Box, Typography } from "@mui/material"
import { useEncounter } from "@/contexts"
import { useForm } from "@/reducers"
import type { Vehicle, Shot } from "@/types"
import { ChaseFormData, initialChaseFormData } from "@/types/chase"
import CRS from "@/services/ChaseReducerService"
import { getAllVisibleShots } from "./attacks/shotSorting"
import ChaseAttackerSection from "./chases/ChaseAttackerSection"
import ChaseTargetSection from "./chases/ChaseTargetSection"
import ChaseResolution from "./chases/ChaseResolution"

interface ChasePanelProps {
  onClose: () => void
}

export default function ChasePanel({ onClose }: ChasePanelProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter, ec } = useEncounter()

  // Delay rendering for animation
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Initialize form state with useForm
  const { formState, dispatchForm } = useForm<ChaseFormData>({
    ...initialChaseFormData,
    shotCost: "3", // Default shot cost
  })

  // Get all characters in the fight (excluding hidden ones)
  const allShots = useMemo(
    () => getAllVisibleShots(encounter.shots),
    [encounter.shots]
  )

  // Get all vehicles from encounter
  const allVehicles = useMemo(() => {
    const vehicles: Vehicle[] = []
    if (!encounter?.shots) return vehicles
    
    encounter.shots.forEach((shot: Shot) => {
      if (shot.vehicles && Array.isArray(shot.vehicles)) {
        vehicles.push(...shot.vehicles)
      }
    })
    
    return vehicles
  }, [encounter?.shots])

  const { attacker, target } = formState.data
  const attackerShotId = (formState.data as any).attackerShotId
  const targetShotId = (formState.data as any).targetShotId

  return (
    <Box sx={{ overflow: "hidden", minHeight: isReady ? "auto" : "100px" }}>
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        Chase Resolution
      </Typography>

      {/* Main Content - Attacker then Target */}
      {isReady ? (
        <>
          <Box sx={{ backgroundColor: "action.hover" }}>
            {/* Attacker Section */}
            <ChaseAttackerSection
              shots={allShots}
              vehicles={allVehicles}
              formState={formState}
              dispatchForm={dispatchForm}
              attacker={attacker}
            />

            {/* Target Section - Only show if attacker selected */}
            {attackerShotId && (
              <ChaseTargetSection
                shots={allShots}
                vehicles={allVehicles}
                formState={formState}
                dispatchForm={dispatchForm}
                target={target}
                attackerShotId={attackerShotId}
              />
            )}
          </Box>

          {/* Resolution Section - Only show if both attacker and target selected */}
          {attackerShotId && targetShotId && (
            <ChaseResolution
              formState={formState}
              dispatchForm={dispatchForm}
              attacker={attacker}
              target={target}
              onClose={onClose}
            />
          )}
        </>
      ) : (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      )}
    </Box>
  )
}