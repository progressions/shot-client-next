"use client"

import { useEffect } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Stack,
} from "@mui/material"
import { CS, VS } from "@/services"
import type { ChaseFormData, Character, Vehicle } from "@/types"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"

interface ChaseMethodSectionProps {
  formState: { data: ChaseFormData }
  dispatchForm: (action: {
    type: string
    name?: string
    value?: unknown
  }) => void
  hasTarget: boolean
  attacker?: Character | null
  vehicle?: Vehicle | null
}

export default function ChaseMethodSection({
  formState,
  dispatchForm,
  hasTarget,
  attacker,
  vehicle,
}: ChaseMethodSectionProps) {
  // Helper to update a field
  const updateField = (name: string, value: unknown) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name,
      value,
    })
  }

  // Initialize driving skill and squeal when attacker/vehicle changes
  useEffect(() => {
    if (attacker && !formState.data.actionValue) {
      const drivingSkill = CS.skill(attacker, "Driving")
      const initialValue = Math.max(7, drivingSkill)
      updateField("actionValue", initialValue)
    }
  }, [attacker?.id])

  useEffect(() => {
    if (vehicle && !formState.data.squeal) {
      const squealValue = VS.squeal(vehicle)
      updateField("squeal", squealValue)
    }
  }, [vehicle?.id])

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: "2px solid",
        borderBottomColor: "divider",
        backgroundColor: "action.hover",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Driving Skill Field - Always visible */}
        <FormControl sx={{ minWidth: 100 }}>
          <InputLabel 
            shrink 
            sx={{ 
              backgroundColor: '#262626',
              px: 0.5,
              ml: -0.5
            }}
          >
            Driving
          </InputLabel>
          <NumberField
            name="actionValue"
            value={formState.data.actionValue || 7}
            size="medium"
            width="80px"
            error={false}
            onChange={e => updateField("actionValue", parseInt(e.target.value) || 7)}
            onBlur={e => {
              const value = parseInt(e.target.value) || 0
              if (value < 1) {
                updateField("actionValue", 7)
              }
            }}
            sx={{ fontSize: "1.5rem" }}
          />
        </FormControl>
        
        {/* Squeal Field - Always visible */}
        <FormControl sx={{ minWidth: 100 }}>
          <InputLabel 
            shrink 
            sx={{ 
              backgroundColor: '#262626',
              px: 0.5,
              ml: -0.5
            }}
          >
            Squeal
          </InputLabel>
          <NumberField
            name="squeal"
            value={formState.data.squeal || 0}
            size="medium"
            width="80px"
            error={false}
            onChange={e => updateField("squeal", parseInt(e.target.value) || 0)}
            onBlur={e => {
              const value = parseInt(e.target.value) || 0
              if (value < 0) {
                updateField("squeal", 0)
              }
            }}
            sx={{ fontSize: "1.5rem" }}
          />
        </FormControl>
        {/* Role Selection */}
        <FormControl 
          sx={{ 
            flex: 1,
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }} 
          disabled={!hasTarget}
        >
          <InputLabel>Role</InputLabel>
          <Select
            disabled={!hasTarget}
            value={formState.data.attackerRole || "pursuer"}
            onChange={e => {
              const newRole = e.target.value as "pursuer" | "evader"
              updateField("attackerRole", newRole)

              // Update default method based on new role and current position
              const position = formState.data.position
              let defaultMethod = "EVADE"
              if (newRole === "pursuer") {
                defaultMethod =
                  position === "near"
                    ? "RAM_SIDESWIPE"
                    : "NARROW_THE_GAP"
              } else {
                defaultMethod =
                  position === "near" ? "WIDEN_THE_GAP" : "EVADE"
              }
              updateField("method", defaultMethod)
            }}
            label="Role"
          >
            <MenuItem value="pursuer">Pursuer</MenuItem>
            <MenuItem value="evader">Evader</MenuItem>
          </Select>
        </FormControl>

        {/* Chase Action Selection */}
        <FormControl 
          sx={{ 
            flex: 1,
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }} 
          disabled={!hasTarget}
        >
          <InputLabel>Chase Action</InputLabel>
          <Select
            disabled={!hasTarget}
            value={(() => {
              // Validate that current method is valid for role/position
              const role = formState.data.attackerRole || "pursuer"
              const position = formState.data.position
              const method = formState.data.method

              if (role === "pursuer") {
                if (position === "near") {
                  // Valid methods: RAM_SIDESWIPE, EVADE
                  return ["RAM_SIDESWIPE", "EVADE"].includes(method)
                    ? method
                    : "RAM_SIDESWIPE"
                } else {
                  // Valid method: NARROW_THE_GAP
                  return "NARROW_THE_GAP"
                }
              } else {
                if (position === "near") {
                  // Valid methods: WIDEN_THE_GAP, RAM_SIDESWIPE
                  return ["WIDEN_THE_GAP", "RAM_SIDESWIPE"].includes(
                    method
                  )
                    ? method
                    : "WIDEN_THE_GAP"
                } else {
                  // Valid method: EVADE
                  return "EVADE"
                }
              }
            })()}
            onChange={e => updateField("method", e.target.value)}
            label="Chase Action"
          >
            {(formState.data.attackerRole || "pursuer") === "pursuer"
              ? // Pursuer options
                formState.data.position === "near"
                ? [
                    // When NEAR, pursuer can ram/sideswipe or evade
                    <MenuItem key="RAM_SIDESWIPE" value="RAM_SIDESWIPE">
                      Ram/Sideswipe
                    </MenuItem>,
                    <MenuItem key="EVADE" value="EVADE">
                      Evade
                    </MenuItem>,
                  ]
                : [
                    // When FAR, pursuer can only narrow the gap
                    <MenuItem
                      key="NARROW_THE_GAP"
                      value="NARROW_THE_GAP"
                    >
                      Narrow the Gap
                    </MenuItem>,
                  ]
              : // Evader options
                formState.data.position === "near"
                ? [
                    // When NEAR, evader can widen the gap or ram/sideswipe
                    <MenuItem key="WIDEN_THE_GAP" value="WIDEN_THE_GAP">
                      Widen the Gap
                    </MenuItem>,
                    <MenuItem key="RAM_SIDESWIPE" value="RAM_SIDESWIPE">
                      Ram/Sideswipe
                    </MenuItem>,
                  ]
                : [
                    // When FAR, evader tries to maintain distance
                    <MenuItem key="EVADE" value="EVADE">
                      Evade
                    </MenuItem>,
                  ]}
          </Select>
        </FormControl>

        {/* Position Selection */}
        <FormControl 
          sx={{ 
            flex: 1,
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }} 
          disabled={!hasTarget}
        >
          <InputLabel>Position</InputLabel>
          <Select
            disabled={!hasTarget}
            value={formState.data.position || "far"}
            onChange={e => {
              const newPosition = e.target.value as "near" | "far"
              updateField("position", newPosition)

              // Update method based on role and new position
              const role = formState.data.attackerRole || "pursuer"
              let defaultMethod = "EVADE"
              if (role === "pursuer") {
                defaultMethod =
                  newPosition === "near"
                    ? "RAM_SIDESWIPE"
                    : "NARROW_THE_GAP"
              } else {
                defaultMethod =
                  newPosition === "near" ? "WIDEN_THE_GAP" : "EVADE"
              }
              updateField("method", defaultMethod)
            }}
            label="Position"
          >
            <MenuItem value="near">Near</MenuItem>
            <MenuItem value="far">Far</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  )
}
