"use client"

import { useState } from "react"
import { Box, Button, Stack, Typography } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { VS, CRS } from "@/services"
import type { ChaseFormData, Vehicle } from "@/types"
import { ChaseMethod } from "@/types/chase"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"
import { useToast } from "@/contexts"
import { useClient } from "@/contexts/AppContext"
import { useEncounter } from "@/contexts"

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

      {/* Results Display */}
      {formState.data.edited && formState.data.actionResult !== null && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: success ? "success.dark" : "error.dark",
            color: "white",
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {success ? "🎯 HIT!" : "❌ MISS!"}
          </Typography>
          
          <Typography variant="body2">
            Roll: {swerve?.result || 0} + {formState.data.actionValue} - {formState.data.modifiedDefense} = {formState.data.actionResult}
          </Typography>
          
          {success && (
            <>
              {chasePoints !== null && chasePoints > 0 && (
                <Typography variant="body1" fontWeight="bold">
                  Chase Points: {chasePoints}
                </Typography>
              )}
              {conditionPoints !== null && conditionPoints > 0 && (
                <Typography variant="body1" fontWeight="bold">
                  Condition Points: {conditionPoints}
                </Typography>
              )}
              <Typography variant="body1">
                New Position: {formState.data.position === "near" ? "NEAR" : "FAR"}
              </Typography>
            </>
          )}
          
          {/* Victory Check */}
          {success && target && VS.chasePoints(target) >= 35 && (
            <Box sx={{ mt: 2, p: 1, bgcolor: "rgba(0,0,0,0.3)", borderRadius: 1 }}>
              {VS.chasePoints(target) >= 50 ? (
                <Typography color="error.light" fontWeight="bold">
                  💥 TOTAL VICTORY! Target defeated!
                </Typography>
              ) : (
                <Typography color="warning.light" fontWeight="bold">
                  ⚠️ VICTORY IMMINENT! ({VS.chasePoints(target)}/35)
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}