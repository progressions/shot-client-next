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
  onClose: () => void
  onComplete?: () => void
}

export default function ChaseResolution({
  formState,
  dispatchForm,
  attacker,
  target,
  onClose,
  onComplete,
}: ChaseResolutionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [, setInitialPosition] = useState<"near" | "far" | null>(null)
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()
  const { encounter } = useEncounter()

  const {
    position,
    typedSwerve,
    swerve,
    success,
    chasePoints,
    conditionPoints,
  } = formState.data

  // Show preview when swerve is typed but not yet resolved
  const showPreview = typedSwerve !== "" && !formState.data.edited

  // Calculate preview values when showing preview
  const previewActionResult =
    showPreview && attacker && target
      ? parseToNumber(formState.data.actionValue) + parseToNumber(typedSwerve)
      : null
  const previewOutcome =
    previewActionResult !== null
      ? previewActionResult -
        parseToNumber(formState.data.defense) -
        (formState.data.stunt ? 2 : 0)
      : null
  const previewSuccess = previewOutcome !== null && previewOutcome >= 0

  // Calculate preview chase points
  let previewChasePoints: number | null = null
  let previewPosition: "near" | "far" = formState.data.position
  if (previewSuccess && previewOutcome !== null) {
    if (formState.data.method === ChaseMethod.RAM_SIDESWIPE) {
      const targetFrame = VS.isMook(target) ? 0 : VS.frame(target)
      previewChasePoints = Math.max(
        0,
        previewOutcome + parseToNumber(formState.data.crunch) - targetFrame
      )
    } else {
      // Use the editable handling value from the form
      const targetHandling = parseToNumber(formState.data.handling)
      previewChasePoints = Math.max(
        0,
        previewOutcome + parseToNumber(formState.data.squeal) - targetHandling
      )
    }

    // Calculate preview position change
    if (
      formState.data.method === ChaseMethod.NARROW_THE_GAP &&
      formState.data.position === "far"
    ) {
      previewPosition = "near"
    } else if (
      formState.data.method === ChaseMethod.WIDEN_THE_GAP &&
      formState.data.position === "near"
    ) {
      previewPosition = "far"
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
      // Roll swerve if not provided
      let swerveValue = swerve
      if (typedSwerve === "") {
        const AS = (CRS as { AS: { swerve: () => typeof swerve } }).AS
        swerveValue = AS.swerve()
      }

      // Process the chase action
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
        swerve: swerveValue,
        edited: true,
      }

      console.log("Chase Resolution - State to process:", {
        method: stateToProcess.method,
        position: stateToProcess.position,
        success: stateToProcess.success,
      })

      const result = CRS.process(stateToProcess)

      console.log("Chase Resolution - Result from CRS.process:", {
        success: result.success,
        chasePoints: result.chasePoints,
        conditionPoints: result.conditionPoints,
        position: result.position,
        targetActionValues: result.target?.action_values,
        attackerActionValues: result.attacker?.action_values,
      })

      // Update form with results
      updateFields(result)

      // Update vehicles in the backend if successful
      if (result.success) {
        // Extract only vehicle-specific action values
        const attackerVehicleValues: Record<string, number> = {}
        const targetVehicleValues: Record<string, number> = {}

        // Vehicle-specific keys that should be updated (Position now managed via ChaseRelationship)
        const vehicleKeys = ["Chase Points", "Condition Points", "Pursuer"]

        // Filter attacker action_values to only include vehicle-specific ones
        if (result.attacker.action_values) {
          vehicleKeys.forEach(key => {
            if (result.attacker.action_values.hasOwnProperty(key)) {
              attackerVehicleValues[key] = result.attacker.action_values[key]
            }
          })
        }

        // Filter target action_values to only include vehicle-specific ones
        if (result.target.action_values) {
          vehicleKeys.forEach(key => {
            if (result.target.action_values.hasOwnProperty(key)) {
              targetVehicleValues[key] = result.target.action_values[key]
            }
          })
        }

        console.log(
          "Chase Resolution - Target vehicle values being sent:",
          targetVehicleValues
        )
        console.log(
          "Chase Resolution - Result target action_values:",
          result.target.action_values
        )

        // Get the actual vehicle IDs from the stored vehicle references
        // or from the driving relationship if needed
        const attackerVehicle =
          (formState.data as ChaseFormData & { vehicle?: Vehicle }).vehicle ||
          (result.attacker?.driving ? result.attacker.driving : null)
        const targetVehicle =
          (formState.data as ChaseFormData & { targetVehicle?: Vehicle })
            .targetVehicle ||
          (result.target?.driving ? result.target.driving : null)

        const attackerVehicleId = attackerVehicle?.id
        const targetVehicleId = targetVehicle?.id

        if (!attackerVehicleId || !targetVehicleId) {
          toastError("Unable to identify vehicles for chase action")
          setIsProcessing(false)
          return
        }

        // Get the shot cost from form state
        const shotCost = parseInt(
          (formState.data as ChaseFormData & { shotCost?: string }).shotCost ||
            "3"
        )

        // Calculate the actual new position based on success and method
        let finalPosition = formState.data.position
        if (result.success) {
          if (
            result.method === ChaseMethod.NARROW_THE_GAP &&
            formState.data.position === "far"
          ) {
            finalPosition = "near"
          } else if (
            result.method === ChaseMethod.WIDEN_THE_GAP &&
            formState.data.position === "near"
          ) {
            finalPosition = "far"
          }
        }

        console.log(
          "Chase Resolution - Original position from form:",
          formState.data.position
        )
        console.log(
          "Chase Resolution - Calculated new position:",
          finalPosition
        )
        console.log("Chase Resolution - Method:", result.method)
        console.log("Chase Resolution - Success:", result.success)

        const vehicleUpdates = [
          {
            vehicle_id: attackerVehicleId,
            target_vehicle_id: targetVehicleId,
            role: formState.data.attackerRole || "pursuer", // Include attacker's role
            shot_cost: shotCost, // Add shot cost for the attacker
            character_id: attacker.id, // Include character ID to spend shots
            action_values: attackerVehicleValues,
            position: finalPosition, // Use the calculated position
            event: {
              type: "chase_action",
              description: `${attacker.name} ${result.method === ChaseMethod.RAM_SIDESWIPE ? "rams" : result.method === ChaseMethod.NARROW_THE_GAP ? "narrows gap with" : result.method === ChaseMethod.WIDEN_THE_GAP ? "widens gap from" : "evades"} ${target.name}`,
              details: {
                method: result.method,
                chase_points: result.chasePoints,
                condition_points: result.conditionPoints,
                position: finalPosition,
                success: result.success,
                shot_cost: shotCost,
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
          },
        ]

        await client.applyChaseAction(encounter, vehicleUpdates)
        toastSuccess("Chase action resolved successfully!")
        if (onComplete) onComplete()
        onClose()
      }
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
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        🏁 Combat Resolution
      </Typography>

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
          <Typography
            variant="caption"
            sx={{ mb: 0.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
          >
            Swerve
          </Typography>
          <NumberField
            name="swerve"
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

      {/* Results Display - Show when swerve is typed or after resolve */}
      {(showPreview ||
        (formState.data.edited && formState.data.actionResult !== null)) && (
        <Alert
          severity={
            (showPreview ? previewSuccess : success) ? "success" : "error"
          }
          sx={{ mt: 3, mb: 2 }}
        >
          <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
            {(showPreview ? previewSuccess : success) ? "Hit!" : "Miss!"}{" "}
            Driving {formState.data.actionValue} + Swerve{" "}
            {showPreview ? typedSwerve : swerve?.result || 0} = Action Result{" "}
            {showPreview ? previewActionResult : formState.data.actionResult}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
            Action Result{" "}
            {showPreview ? previewActionResult : formState.data.actionResult} -
            Driving {formState.data.defense}
            {formState.data.stunt ? " + 2 (stunt)" : ""} = Outcome{" "}
            {showPreview ? previewOutcome : formState.data.outcome}
          </Typography>
          {(showPreview ? previewSuccess : success) && (
            <>
              <Typography variant="caption" sx={{ display: "block" }}>
                {formState.data.method === ChaseMethod.RAM_SIDESWIPE
                  ? `Outcome ${showPreview ? previewOutcome : formState.data.outcome} + Crunch ${formState.data.crunch} - Frame ${formState.data.frame} = Chase Points ${showPreview ? previewChasePoints : chasePoints}, Condition Points ${showPreview ? previewChasePoints : conditionPoints}`
                  : `Outcome ${showPreview ? previewOutcome : formState.data.outcome} + Squeal ${formState.data.squeal} - Handling ${formState.data.handling} = Chase Points ${showPreview ? previewChasePoints : chasePoints}`}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                New position:{" "}
                {showPreview
                  ? previewPosition === "near"
                    ? "Near"
                    : "Far"
                  : position === "near"
                    ? "Near"
                    : "Far"}
              </Typography>
            </>
          )}
        </Alert>
      )}
    </Box>
  )
}
