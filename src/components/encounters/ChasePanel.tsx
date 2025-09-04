"use client"

import { useMemo, useEffect, useState } from "react"
import { Box, Typography } from "@mui/material"
import { useEncounter, useClient } from "@/contexts"
import { useForm, FormActions } from "@/reducers"
import type { Vehicle, Shot, ChaseRelationship, Character } from "@/types"
import { ChaseFormData, initialChaseFormData } from "@/types/chase"
import { getAllVisibleShots } from "./attacks/shotSorting"
import ChaseAttackerSection from "./chases/ChaseAttackerSection"
import ChaseTargetSection from "./chases/ChaseTargetSection"
import ChaseResolution from "./chases/ChaseResolution"

interface ChasePanelProps {
  onClose?: () => void
  preselectedCharacter?: Character
}

export default function ChasePanel({ onClose, preselectedCharacter }: ChasePanelProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter } = useEncounter()
  const { client } = useClient()

  // Delay rendering for animation
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Initialize form state with useForm
  const { formState, dispatchForm } = useForm<ChaseFormData>({
    ...initialChaseFormData,
    attackerShotId: preselectedCharacter?.shot_id || "",
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
  const attackerShotId = (formState.data as { attackerShotId?: string })
    .attackerShotId
  const _targetShotId = (formState.data as { targetShotId?: string })
    .targetShotId

  // Monitor position changes
  useEffect(() => {
    console.log("Position in formState changed to:", formState.data.position)
  }, [formState.data.position])

  // Fetch existing chase relationship when both vehicles are selected
  useEffect(() => {
    async function fetchExistingRelationship() {
      console.log("Checking vehicles - attacker:", attacker, "target:", target)

      // Get the actual vehicle IDs from the form state
      const attackerVehicle = (
        formState.data as ChaseFormData & { vehicle?: Vehicle }
      ).vehicle
      const targetVehicle = (
        formState.data as ChaseFormData & { targetVehicle?: Vehicle }
      ).targetVehicle

      console.log("Form state vehicles:", {
        attackerVehicle,
        targetVehicle,
        hasAttackerId: attackerVehicle?.id,
        hasTargetId: targetVehicle?.id,
      })

      if (!attackerVehicle?.id || !targetVehicle?.id || !encounter?.id) {
        console.log("Missing vehicle or encounter data:", {
          attackerVehicle,
          targetVehicle,
          encounter: encounter?.id,
        })
        return
      }

      console.log("Fetching chase relationships for:", {
        attackerVehicleId: attackerVehicle.id,
        targetVehicleId: targetVehicle.id,
        fightId: encounter.id,
      })

      try {
        // Get chase relationships for this fight
        const response = await client.getChaseRelationships({
          fight_id: encounter.id,
          active: true,
        })

        console.log("Chase relationships response:", response.data)

        if (response.data?.chase_relationships) {
          const attackerVehicleId = attackerVehicle.id
          const targetVehicleId = targetVehicle.id

          console.log("Looking for relationship with vehicles:", {
            attackerVehicleId,
            targetVehicleId,
          })

          // Log each relationship check
          response.data.chase_relationships.forEach(
            (rel: ChaseRelationship) => {
              console.log("Checking relationship:", {
                rel,
                match1:
                  rel.pursuer_id === attackerVehicleId &&
                  rel.evader_id === targetVehicleId,
                match2:
                  rel.evader_id === attackerVehicleId &&
                  rel.pursuer_id === targetVehicleId,
              })
            }
          )

          // Find relationship between these two vehicles (checking both directions)
          const relationship = response.data.chase_relationships.find(
            (rel: ChaseRelationship) =>
              (rel.pursuer_id === attackerVehicleId &&
                rel.evader_id === targetVehicleId) ||
              (rel.evader_id === attackerVehicleId &&
                rel.pursuer_id === targetVehicleId)
          )

          console.log("Found relationship:", relationship)

          if (relationship) {
            console.log("Updating form with relationship data:", {
              position: relationship.position,
              attackerVehicleId,
              pursuer_id: relationship.pursuer_id,
              isAttackerPursuer: relationship.pursuer_id === attackerVehicleId,
            })

            // Update position from existing relationship
            console.log("About to update position to:", relationship.position)
            console.log(
              "Current formState.data.position before update:",
              formState.data.position
            )

            const action = {
              type: FormActions.UPDATE,
              name: "position",
              value: relationship.position,
            }
            console.log("Dispatching action:", action)
            dispatchForm(action)

            console.log("Position update dispatched")
            // Check immediately after dispatch (won't show new value due to React state update timing)
            setTimeout(() => {
              console.log(
                "Position after dispatch (delayed check):",
                formState.data.position
              )
            }, 100)

            // Determine attacker's role based on relationship
            const attackerRole =
              relationship.pursuer_id === attackerVehicleId
                ? "pursuer"
                : "evader"
            console.log("Setting attacker role:", attackerRole)

            dispatchForm({
              type: FormActions.UPDATE,
              name: "attackerRole",
              value: attackerRole,
            })

            // Update method based on role and position
            let defaultMethod = "EVADE"
            if (attackerRole === "pursuer") {
              defaultMethod =
                relationship.position === "near"
                  ? "RAM_SIDESWIPE"
                  : "NARROW_THE_GAP"
            } else {
              defaultMethod =
                relationship.position === "near" ? "WIDEN_THE_GAP" : "EVADE"
            }
            console.log("Setting default method:", defaultMethod)

            dispatchForm({
              type: FormActions.UPDATE,
              name: "method",
              value: defaultMethod,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching chase relationships:", error)
      }
    }

    fetchExistingRelationship()
  }, [attacker, formState.data, target, encounter?.id, client, dispatchForm])

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
            {/* Attacker Section - Only show if not preselected */}
            {!preselectedCharacter && (
              <ChaseAttackerSection
                shots={allShots}
                vehicles={allVehicles}
                formState={formState}
                dispatchForm={dispatchForm}
                attacker={attacker}
                target={target}
              />
            )}

            {/* Target Section - Always show */}
            <ChaseTargetSection
              shots={allShots}
              vehicles={allVehicles}
              formState={formState}
              dispatchForm={dispatchForm}
              target={target}
              attacker={attacker}
              attackerShotId={attackerShotId}
            />
          </Box>

          {/* Resolution Section - Always show */}
          <ChaseResolution
            formState={formState}
            dispatchForm={dispatchForm}
            attacker={attacker}
            target={target}
            onClose={onClose}
          />
        </>
      ) : (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      )}
    </Box>
  )
}
