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
  dispatchForm: (action: any) => void
  attacker: Vehicle | null
  target: Vehicle | null
  onClose: () => void
}

export default function ChaseResolution({
  formState,
  dispatchForm,
  attacker,
  target,
  onClose,
}: ChaseResolutionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()
  const { encounter } = useEncounter()
  
  const { method, position, typedSwerve, swerve, success, chasePoints, conditionPoints } = formState.data
  
  // Show preview when swerve is typed but not yet resolved
  const showPreview = typedSwerve !== "" && !formState.data.edited
  
  // Calculate preview values when showing preview
  const previewActionResult = showPreview && attacker && target ? 
    parseToNumber(formState.data.actionValue) + parseToNumber(typedSwerve) : null
  const previewOutcome = previewActionResult !== null ? 
    previewActionResult - parseToNumber(formState.data.defense) - (formState.data.stunt ? 2 : 0) : null
  const previewSuccess = previewOutcome !== null && previewOutcome >= 0
  
  // Calculate preview chase points
  let previewChasePoints: number | null = null
  if (previewSuccess && previewOutcome !== null) {
    if (formState.data.method === ChaseMethod.RAM_SIDESWIPE) {
      const targetFrame = VS.isMook(target) ? 0 : VS.frame(target)
      previewChasePoints = Math.max(0, previewOutcome + parseToNumber(formState.data.crunch) - targetFrame)
    } else {
      // Use the editable handling value from the form
      const targetHandling = parseToNumber(formState.data.handling)
      previewChasePoints = Math.max(0, previewOutcome + parseToNumber(formState.data.squeal) - targetHandling)
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
    
    try {
      // Roll swerve if not provided
      let swerveValue = swerve
      if (typedSwerve === "") {
        const AS = (CRS as any).AS
        swerveValue = AS.swerve()
      }

      // Process the chase action
      const stateToProcess = {
        ...formState.data,
        swerve: swerveValue,
        edited: true,
      }
      
      const result = CRS.process(stateToProcess)
      
      // Update form with results
      updateFields(result)
      
      // Update vehicles in the backend if successful
      if (result.success) {
        // Update attacker
        const attackerFormData = new FormData()
        attackerFormData.append("vehicle[action_values]", JSON.stringify(result.attacker.action_values))
        await client.updateVehicle(result.attacker.id, attackerFormData)
        
        // Update target
        const targetFormData = new FormData()
        targetFormData.append("vehicle[action_values]", JSON.stringify(result.target.action_values))
        await client.updateVehicle(result.target.id, targetFormData)
        
        toastSuccess("Chase action resolved successfully!")
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
          disabled={!attacker || !target || isProcessing}
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
      {(showPreview || (formState.data.edited && formState.data.actionResult !== null)) && (
        <Alert 
          severity={(showPreview ? previewSuccess : success) ? "success" : "error"} 
          sx={{ mt: 3, mb: 2 }}
        >
          <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
            {(showPreview ? previewSuccess : success) ? "Hit!" : "Miss!"} Driving {formState.data.actionValue} + Swerve {showPreview ? typedSwerve : (swerve?.result || 0)} = Action Result {showPreview ? previewActionResult : formState.data.actionResult}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
            Action Result {showPreview ? previewActionResult : formState.data.actionResult} - Driving {formState.data.defense}{formState.data.stunt ? " + 2 (stunt)" : ""} = Outcome {showPreview ? previewOutcome : formState.data.outcome}
          </Typography>
          {(showPreview ? previewSuccess : success) && (
            <Typography variant="caption" sx={{ display: "block" }}>
              {formState.data.method === ChaseMethod.RAM_SIDESWIPE 
                ? `Outcome ${showPreview ? previewOutcome : formState.data.outcome} + Crunch ${formState.data.crunch} - Frame ${target ? VS.frame(target) : 0} = Chase Points ${showPreview ? previewChasePoints : chasePoints}`
                : `Outcome ${showPreview ? previewOutcome : formState.data.outcome} + Squeal ${formState.data.squeal} - Handling ${formState.data.handling} = Chase Points ${showPreview ? previewChasePoints : chasePoints}`
              }
            </Typography>
          )}
        </Alert>
      )}
      
      {/* Additional results - only show after resolve, not in preview */}
      {!showPreview && formState.data.edited && success && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
          {chasePoints !== null && chasePoints > 0 && (
            <Typography variant="body1" fontWeight="bold">
              Chase Points Dealt: {chasePoints}
            </Typography>
          )}
          {conditionPoints !== null && conditionPoints > 0 && (
            <Typography variant="body1" fontWeight="bold">
              Condition Points Dealt: {conditionPoints}
            </Typography>
          )}
          <Typography variant="body1">
            New Position: {formState.data.position === "near" ? "NEAR" : "FAR"}
          </Typography>
          
          {/* Victory Check */}
          {target && VS.chasePoints(target) >= 35 && (
            <Box sx={{ mt: 2, p: 1, bgcolor: "warning.main", color: "warning.contrastText", borderRadius: 1 }}>
              {VS.chasePoints(target) >= 50 ? (
                <Typography fontWeight="bold">
                  💥 TOTAL VICTORY! Target defeated!
                </Typography>
              ) : (
                <Typography fontWeight="bold">
                  ⚠️ VICTORY! ({VS.chasePoints(target)}/35)
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}