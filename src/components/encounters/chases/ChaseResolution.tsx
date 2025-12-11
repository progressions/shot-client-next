"use client"

import { useState } from "react"
import { Box, Button, Stack, Typography, Alert } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { VS, CRS } from "@/services"
import type { ChaseFormData, Vehicle } from "@/types"
import { ChaseMethod } from "@/types/chase"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"
import { useToast } from "@/contexts"
import { useClient } from "@/contexts/AppContext"
import { useEncounter } from "@/contexts"
import { parseToNumber } from "@/lib/parseToNumber"

interface ChaseResolutionProps {
  formState: { data: ChaseFormData }
  dispatchForm: (action: {
    type: string
    name?: string
    value?: unknown
  }) => void
  attacker: Vehicle | null
  target: Vehicle | null
  onComplete?: () => void
}

export default function ChaseResolution({
  formState,
  dispatchForm,
  attacker,
  target,
  onComplete,
}: ChaseResolutionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [, setInitialPosition] = useState<"near" | "far" | null>(null)
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()
  const { encounter } = useEncounter()

  const { typedSwerve, swerve } = formState.data

  // Only show results display when user has typed a swerve value
  const showResults = typedSwerve !== ""

  // Always calculate using editable form values with the typed or rolled swerve
  const currentSwerve =
    typedSwerve !== "" ? parseToNumber(typedSwerve) : swerve?.result || 0
  const fortuneBonus = parseToNumber(
    (formState.data as ChaseFormData & { fortuneBonus?: string })
      .fortuneBonus || "0"
  )
  const actionResult =
    parseToNumber(formState.data.actionValue) + fortuneBonus + currentSwerve
  const outcome =
    actionResult -
    parseToNumber(formState.data.defense) -
    (formState.data.stunt ? 2 : 0)
  const isSuccess = outcome >= 0

  // Calculate chase points using editable form values
  let calculatedChasePoints = 0
  let calculatedConditionPoints = 0
  let calculatedPosition: "near" | "far" = formState.data.position

  if (isSuccess) {
    if (formState.data.method === ChaseMethod.RAM_SIDESWIPE) {
      const targetFrame = parseToNumber(formState.data.frame)
      const targetCrunch = parseToNumber(
        (formState.data as ChaseFormData & { targetCrunch?: string })
          .targetCrunch || "0"
      )
      calculatedChasePoints = Math.max(0, outcome + targetCrunch - targetFrame)
      calculatedConditionPoints = calculatedChasePoints
    } else {
      const targetHandling = parseToNumber(formState.data.handling)
      calculatedChasePoints = Math.max(
        0,
        outcome + parseToNumber(formState.data.squeal) - targetHandling
      )
    }

    // Calculate position change
    if (
      formState.data.method === ChaseMethod.NARROW_THE_GAP &&
      formState.data.position === "far"
    ) {
      calculatedPosition = "near"
    } else if (
      formState.data.method === ChaseMethod.WIDEN_THE_GAP &&
      formState.data.position === "near"
    ) {
      calculatedPosition = "far"
    }
  }

  // Helper to update a field
  const updateField = (name: string, value: unknown) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name,
      value,
    })
  }

  // Helper to update multiple fields
  const updateFields = (updates: Partial<ChaseFormData>) => {
    dispatchForm({
      type: FormActions.UPDATE_MULTIPLE,
      updates,
    })
  }

  // Process the chase action
  const handleResolve = async () => {
    if (!attacker || !target) return

    setIsProcessing(true)

    // Store initial position before processing
    setInitialPosition(formState.data.position)

    try {
      // Just use the SAME values we're already calculating for display!
      // If user hasn't typed a swerve, roll one
      if (typedSwerve === "") {
        const AS = (CRS as { AS: { swerve: () => typeof swerve } }).AS
        const rolledSwerve = AS.swerve()
        updateField("typedSwerve", String(rolledSwerve?.result || 0))
      }

      // Now use the EXACT same calculated values from the display
      const finalChasePoints = calculatedChasePoints
      const finalConditionPoints = calculatedConditionPoints
      const actualSuccess = isSuccess
      const finalPosition = calculatedPosition
      const actualOutcome = outcome
      const actualActionResult = actionResult

      // Process the chase action for other side effects
      // Use the actual vehicles, not the characters
      const attackerVehicle = (
        formState.data as ChaseFormData & { vehicle?: Vehicle }
      ).vehicle
      const targetVehicle = (
        formState.data as ChaseFormData & { targetVehicle?: Vehicle }
      ).targetVehicle

      const stateToProcess = {
        ...formState.data,
        attacker: attackerVehicle || formState.data.attacker,
        target: targetVehicle || formState.data.target,
        targetCrunch: (
          formState.data as ChaseFormData & { targetCrunch?: number }
        ).targetCrunch,
        swerve: { result: currentSwerve }, // Use the same currentSwerve from display
        edited: true,
      }

      console.log("Chase Resolution - Using display values:", {
        currentSwerve,
        actionResult: actualActionResult,
        outcome: actualOutcome,
        isSuccess: actualSuccess,
        calculatedChasePoints: finalChasePoints,
        calculatedConditionPoints: finalConditionPoints,
        calculatedPosition: finalPosition,
      })

      const result = CRS.process(stateToProcess)

      // Override with our display values
      const correctedResult = {
        ...result,
        success: actualSuccess,
        chasePoints: finalChasePoints,
        conditionPoints: finalConditionPoints,
        outcome: actualOutcome,
        actionResult: actualActionResult,
        position: finalPosition,
      }

      // Update form with corrected results
      updateFields(correctedResult)

      // Update vehicles in the backend (even for failed attempts - attacker still spends shots)
      // For chase actions, the damage (chase points) is applied to the target
      // result.chasePoints contains the amount of damage dealt
      const attackerVehicleValues: Record<string, number> = {}
      const targetVehicleValues: Record<string, number> = {}

      // The attacker doesn't take damage (unless it's a ram/sideswipe with bump)
      // So we don't need to update the attacker's chase points

      // The target takes the chase points damage (only if successful)
      // Use our calculated values
      if (actualSuccess && finalChasePoints > 0) {
        targetVehicleValues["Chase Points"] = finalChasePoints
      }

      // For RAM_SIDESWIPE, also apply condition points (only if successful)
      if (
        actualSuccess &&
        formState.data.method === ChaseMethod.RAM_SIDESWIPE &&
        finalConditionPoints > 0
      ) {
        targetVehicleValues["Condition Points"] = finalConditionPoints
      }

      console.log(
        "Chase Resolution - Target vehicle values being sent:",
        targetVehicleValues
      )
      console.log(
        "Chase Resolution - Result target action_values:",
        result.target.action_values
      )

      // Get the vehicle IDs (vehicles were already extracted earlier)
      const attackerVehicleId = attackerVehicle?.id
      const targetVehicleId = targetVehicle?.id

      if (!attackerVehicleId || !targetVehicleId) {
        toastError("Unable to identify vehicles for chase action")
        setIsProcessing(false)
        return
      }

      // Get the shot cost from form state
      const shotCost = formState.data.shotCost || 3

      // Get the driver character ID from form state
      // The 'attacker' in form state is actually the driver character
      const driverCharacterId = (
        formState.data as ChaseFormData & { attacker?: Character }
      ).attacker?.id

      console.log("Chase Resolution - Shot cost:", shotCost)
      console.log("Chase Resolution - Driver character ID:", driverCharacterId)
      console.log(
        "Chase Resolution - Position change:",
        formState.data.position,
        "->",
        finalPosition
      )

      // Include action_type for ram/sideswipe tracking
      const actionType =
        formState.data.method === ChaseMethod.RAM_SIDESWIPE
          ? "ram"
          : formState.data.method === ChaseMethod.NARROW_THE_GAP ||
              formState.data.method === ChaseMethod.WIDEN_THE_GAP
            ? "chase_maneuver"
            : "evade"

      // Check if Fortune was used
      const fortuneUsed = fortuneBonus > 0 ? 1 : 0

      const vehicleUpdates = [
        {
          vehicle_id: attackerVehicleId,
          target_vehicle_id: targetVehicleId,
          role: formState.data.attackerRole || "pursuer", // Include attacker's role
          shot_cost: shotCost, // Add shot cost for the attacker
          character_id: driverCharacterId, // Use driver's character ID to spend shots
          fortune_spent: fortuneUsed, // Add fortune spent
          action_values: attackerVehicleValues,
          position: finalPosition, // Use the calculated position
          event: {
            type: "chase_action",
            description: `${attacker.name} ${formState.data.method === ChaseMethod.RAM_SIDESWIPE ? "rams" : formState.data.method === ChaseMethod.NARROW_THE_GAP ? "narrows gap with" : formState.data.method === ChaseMethod.WIDEN_THE_GAP ? "widens gap from" : "evades"} ${target.name}${actualSuccess ? "" : " (missed)"}${fortuneUsed > 0 ? " [Fortune]" : ""}`,
            details: {
              method: formState.data.method,
              chase_points: finalChasePoints,
              condition_points: finalConditionPoints,
              position: finalPosition,
              success: actualSuccess,
              shot_cost: shotCost,
              fortune_spent: fortuneUsed,
            },
          },
        },
        {
          vehicle_id: targetVehicleId,
          target_vehicle_id: attackerVehicleId,
          role:
            formState.data.attackerRole === "pursuer" ? "evader" : "pursuer", // Target has opposite role
          position: finalPosition, // Use the calculated position
          action_values: targetVehicleValues,
          action_type: actionType, // Track if target was rammed
        },
      ]

      await client.applyChaseAction(encounter, vehicleUpdates)

      // Check if target will be defeated after applying damage (only if successful)
      if (actualSuccess) {
        const targetChasePoints =
          (target.action_values?.["Chase Points"] || 0) + finalChasePoints
        const defeatThreshold = VS.getDefeatThreshold(target)
        const willBeDefeated = targetChasePoints >= defeatThreshold
        const defeatType =
          formState.data.method === ChaseMethod.RAM_SIDESWIPE
            ? "crashed"
            : "boxed in"

        if (willBeDefeated) {
          toastSuccess(`${target.name} has been ${defeatType}!`)
        } else {
          toastSuccess("Chase action resolved successfully!")
        }
      } else {
        toastSuccess("Chase action missed - shots spent")
      }

      if (onComplete) onComplete()
    } catch (error) {
      toastError("Failed to process chase action")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderTop: "2px solid",
        borderTopColor: "divider",
        backgroundColor: "background.default",
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 2 }}
        alignItems="center"
        justifyContent="center"
        sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}
      >
        {/* Swerve */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: { xs: "80px", sm: "auto" },
          }}
        >
          <NumberField
            name="swerve"
            label="Swerve"
            value={typedSwerve || ""}
            size="large"
            width="120px"
            error={false}
            onChange={e => updateField("typedSwerve", e.target.value)}
            onBlur={e => {
              const val = e.target.value
              if (val === "" || val === "-") {
                updateField("typedSwerve", "0")
              } else {
                updateField("typedSwerve", val)
              }
            }}
            labelBackgroundColor="#0a0a0a"
          />
        </Box>

        {/* Resolve Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<CheckCircleIcon />}
          onClick={handleResolve}
          disabled={!attacker || !target || isProcessing || typedSwerve === ""}
          sx={{
            ml: { xs: 0, sm: 2 },
            mt: { xs: 1, sm: 0 },
            minWidth: { xs: "150px", sm: "180px" },
            fontSize: { xs: "1rem", sm: "1.1rem" },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          {isProcessing ? "Processing..." : "RESOLVE"}
        </Button>
      </Stack>

      {/* Results Display - Only show when swerve is typed */}
      {showResults && (
        <Alert severity={isSuccess ? "success" : "error"} sx={{ mt: 3, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
            {isSuccess ? "Hit!" : "Miss!"} Driving {formState.data.actionValue}
            {fortuneBonus > 0 && ` + Fortune ${fortuneBonus}`} + Swerve{" "}
            {currentSwerve} = Action Result {actionResult}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
            Action Result {actionResult} - Driving {formState.data.defense}
            {formState.data.stunt ? " + 2 (stunt)" : ""} = Outcome {outcome}
          </Typography>
          {isSuccess && (
            <>
              <Typography variant="caption" sx={{ display: "block" }}>
                {formState.data.method === ChaseMethod.RAM_SIDESWIPE
                  ? `Outcome ${outcome} + Crunch ${(formState.data as ChaseFormData & { targetCrunch?: string }).targetCrunch || "0"} - Frame ${formState.data.frame} = Chase Points ${calculatedChasePoints}, Condition Points ${calculatedConditionPoints}`
                  : `Outcome ${outcome} + Squeal ${formState.data.squeal} - Handling ${formState.data.handling} = Chase Points ${calculatedChasePoints}`}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                New position: {calculatedPosition === "near" ? "Near" : "Far"}
              </Typography>
            </>
          )}
        </Alert>
      )}
    </Box>
  )
}
