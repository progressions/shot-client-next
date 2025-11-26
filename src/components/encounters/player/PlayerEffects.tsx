"use client"

import { Box, Typography, Stack, Chip } from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import type { Character, CharacterEffect } from "@/types"
import CharacterEffectsDisplay from "../effects/CharacterEffectsDisplay"

interface PlayerEffectsProps {
  character: Character
  effects?: CharacterEffect[]
}

type Severity = "error" | "warning" | "info" | "success"

const severityColors: Record<
  Severity,
  "error" | "warning" | "info" | "success"
> = {
  error: "error",
  warning: "warning",
  info: "info",
  success: "success",
}

export default function PlayerEffects({
  character,
  effects = [],
}: PlayerEffectsProps) {
  if (effects.length === 0) {
    return null
  }

  // Group effects by severity for display
  const groupedEffects = effects.reduce(
    (acc, effect) => {
      const severity = effect.severity as Severity
      if (!acc[severity]) {
        acc[severity] = []
      }
      acc[severity].push(effect)
      return acc
    },
    {} as Record<Severity, CharacterEffect[]>
  )

  const severityOrder: Severity[] = ["error", "warning", "info", "success"]

  return (
    <Box sx={{ p: 1, mb: 0.5 }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, fontWeight: "bold", color: "text.secondary" }}
      >
        EFFECTS
      </Typography>

      <Box
        sx={{
          p: 1,
          backgroundColor: "background.paper",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Effects list with details */}
        <Stack spacing={0.5}>
          {severityOrder.map(severity => {
            const severityEffects = groupedEffects[severity]
            if (!severityEffects || severityEffects.length === 0) return null

            return severityEffects.map(effect => (
              <Box
                key={effect.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  bgcolor: `${severityColors[severity]}.dark`,
                  opacity: 0.9,
                }}
              >
                <InfoOutlinedIcon
                  fontSize="small"
                  color={severityColors[severity]}
                  sx={{ fontSize: 16 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.8rem",
                      color: `${severityColors[severity]}.contrastText`,
                    }}
                  >
                    {effect.name}
                  </Typography>
                  {effect.action_value && effect.change && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.7rem",
                        color: `${severityColors[severity]}.contrastText`,
                        opacity: 0.9,
                      }}
                    >
                      {effect.action_value === "MainAttack"
                        ? "Attack"
                        : effect.action_value}{" "}
                      {effect.change}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={severity}
                  size="small"
                  color={severityColors[severity]}
                  sx={{
                    height: 18,
                    "& .MuiChip-label": {
                      px: 0.75,
                      fontSize: "0.6rem",
                      textTransform: "uppercase",
                    },
                  }}
                />
              </Box>
            ))
          })}
        </Stack>

        {/* Include the CharacterEffectsDisplay for GM add functionality */}
        <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
          <CharacterEffectsDisplay character={character} effects={effects} />
        </Box>
      </Box>
    </Box>
  )
}
