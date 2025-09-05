"use client"

import { useEffect } from "react"
import { Box, Typography, Stack } from "@mui/material"
import { CS } from "@/services"
import type { Character, ChaseFormData } from "@/types"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"
import Avatar from "@/components/avatars/Avatar"
import { CharacterLink, VehicleLink } from "@/components/ui/links"

interface ChaseAttackerInfoProps {
  attacker: Character | null
  formState: { data: ChaseFormData }
  dispatchForm: (action: {
    type: string
    name?: string
    value?: unknown
  }) => void
}

export default function ChaseAttackerInfo({
  attacker,
  formState,
  dispatchForm,
}: ChaseAttackerInfoProps) {
  // Helper to update a field
  const updateField = (name: string, value: unknown) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name,
      value,
    })
  }

  // Initialize driving skill when attacker changes
  useEffect(() => {
    if (attacker) {
      const drivingSkill = CS.skill(attacker, "Driving")
      const initialValue = Math.max(7, drivingSkill)
      updateField("actionValue", initialValue)
    }
  }, [attacker?.id])

  if (!attacker) {
    return null
  }

  const vehicle = (attacker as Character & { driving?: any }).driving

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: "2px solid",
        borderBottomColor: "divider",
        backgroundColor: "action.hover",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        🏎️ Attacker
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar entity={attacker} sx={{ width: 48, height: 48 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            <CharacterLink character={attacker}>{attacker.name}</CharacterLink>
            {vehicle && (
              <>
                {" driving "}
                <VehicleLink vehicle={vehicle}>{vehicle.name}</VehicleLink>
              </>
            )}
          </Typography>
        </Box>

        {/* Editable Driving Skill */}
        <Box>
          <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
            Driving Skill
          </Typography>
          <NumberField
            name="actionValue"
            value={formState.data.actionValue || 7}
            size="small"
            width="80px"
            error={false}
            onChange={e =>
              updateField("actionValue", parseInt(e.target.value) || 7)
            }
            onBlur={e => {
              const value = parseInt(e.target.value) || 0
              if (value < 1) {
                updateField("actionValue", 7)
              }
            }}
          />
        </Box>
      </Stack>
    </Box>
  )
}
