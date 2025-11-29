"use client"

import { useMemo, useEffect, useState } from "react"
import { Box, Typography } from "@mui/material"
import { FaCar } from "react-icons/fa6"
import { useEncounter, useClient } from "@/contexts"
import BasePanel from "./BasePanel"
import { useForm, FormActions } from "@/reducers"
import type { Vehicle, Shot, ChaseRelationship, Character } from "@/types"
import { ChaseFormData, initialChaseFormData } from "@/types/chase"
import { CS } from "@/services"
import { getAllVisibleShots } from "./attacks/shotSorting"
import ChaseTargetSection from "./chases/ChaseTargetSection"
import ChaseMethodSection from "./chases/ChaseMethodSection"
import ChaseResolution from "./chases/ChaseResolution"

interface ChasePanelProps {
  onComplete?: () => void
  preselectedCharacter?: Character
}

export default function ChasePanel({
  onComplete,
  preselectedCharacter,
}: ChasePanelProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter } = useEncounter()
  const { client } = useClient()

  // Delay rendering for animation
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Get all characters in the fight (excluding hidden ones)
  const allShots = useMemo(
    () => getAllVisibleShots(encounter.shots),
    [encounter.shots]
  )

  // Get all vehicles from encounter - moved up so it's available for initialization
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

  // Get the attacker's vehicle if they're driving
  const getAttackerVehicle = () => {
    if (!preselectedCharacter) return undefined
    const drivingInfo = (
      preselectedCharacter as Character & { driving?: Vehicle }
    ).driving
    if (!drivingInfo) return undefined

    // Try to find the full vehicle data from allVehicles
    const fullVehicle = allVehicles.find(v => v.id === drivingInfo.id)
    return fullVehicle || drivingInfo
  }

  // Initialize form state with useForm
  const { formState, dispatchForm } = useForm<ChaseFormData>({
    ...initialChaseFormData,
    attackerShotId: preselectedCharacter?.shot_id || "",
    shotCost: preselectedCharacter
      ? CS.isBoss(preselectedCharacter) || CS.isUberBoss(preselectedCharacter)
        ? 2
        : 3
      : 3, // Set based on character type
    attacker: preselectedCharacter || undefined,
    vehicle: getAttackerVehicle(),
  })

  const { attacker, target } = formState.data
  const attackerShotId = (formState.data as { attackerShotId?: string })
    .attackerShotId
  const _targetShotId = (formState.data as { targetShotId?: string })
    .targetShotId

  // Get the vehicles from formState - ChaseResolution needs Vehicle objects, not Characters
  const attackerVehicle = (
    formState.data as ChaseFormData & { vehicle?: Vehicle }
  ).vehicle
  const targetVehicle = (
    formState.data as ChaseFormData & { targetVehicle?: Vehicle }
  ).targetVehicle

  // Monitor position changes
  useEffect(() => {
    console.log("Position in formState changed to:", formState.data.position)
  }, [formState.data.position])

  // Fetch existing chase relationship when both vehicles are selected
  useEffect(() => {
    async function fetchExistingRelationship() {
      console.log("Checking vehicles - attacker:", attacker, "target:", target)
      console.log(
        "Fetching relationship for vehicles:",
        attackerVehicle?.id,
        targetVehicle?.id
      )

      if (!attackerVehicle?.id || !targetVehicle?.id || !encounter?.id) {
        console.log(
          "Missing vehicle or encounter data for relationship fetch:",
          {
            attackerVehicleId: attackerVehicle?.id,
            targetVehicleId: targetVehicle?.id,
            targetVehicle,
            encounter: encounter?.id,
          }
        )
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we want to trigger when vehicle IDs change
  }, [
    attackerVehicle?.id,
    targetVehicle?.id,
    encounter?.id,
    client,
    dispatchForm,
  ])

  return (
    <BasePanel title="Chase" icon={<FaCar />} borderColor="secondary.main">
      {/* Main Content - Two Column Grid */}
      {isReady ? (
        <>
          {/* Two-column layout for Attacker/Method and Target */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 0.5,
              p: 0.5,
              backgroundColor: "action.hover",
            }}
          >
            {/* Left Column: Attacker and Method */}
            <Box sx={{ minWidth: 0 }}>
              {/* Method Section - disabled until target selected */}
              <ChaseMethodSection
                formState={formState}
                dispatchForm={dispatchForm}
                hasTarget={
                  !!(formState.data as { targetShotId?: string }).targetShotId
                }
                attacker={preselectedCharacter}
                vehicle={
                  (formState.data as ChaseFormData & { vehicle?: Vehicle })
                    .vehicle || null
                }
              />
            </Box>

            {/* Right Column: Target */}
            <Box sx={{ minWidth: 0 }}>
              {/* Target Section */}
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
          </Box>

          {/* Resolution Section - Below the grid */}
          <ChaseResolution
            formState={formState}
            dispatchForm={dispatchForm}
            attacker={attackerVehicle || null}
            target={targetVehicle || null}
            onComplete={onComplete}
          />
        </>
      ) : (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      )}
    </BasePanel>
  )
}
