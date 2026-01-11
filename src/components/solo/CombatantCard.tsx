"use client"

import {
  Box,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  Chip,
} from "@mui/material"
import { EntityAvatar } from "@/components/avatars"
import type { Combatant } from "@/contexts/SoloEncounterContext"

interface CombatantCardProps {
  combatant: Combatant
  isActive?: boolean
  onSelect?: (combatant: Combatant) => void
}

export function CombatantCard({
  combatant,
  isActive,
  onSelect,
}: CombatantCardProps) {
  const healthPercent = Math.max(
    0,
    Math.min(
      100,
      ((combatant.maxWounds - combatant.wounds) / combatant.maxWounds) * 100
    )
  )

  const getHealthColor = () => {
    if (healthPercent > 60) return "success"
    if (healthPercent > 30) return "warning"
    return "error"
  }

  // Create a minimal entity object for the avatar
  const avatarEntity = {
    id: combatant.id,
    name: combatant.name,
    image_url: combatant.imageUrl || "",
  }

  return (
    <Paper
      elevation={isActive ? 3 : 1}
      onClick={() => onSelect?.(combatant)}
      sx={{
        p: 1.5,
        cursor: onSelect ? "pointer" : "default",
        border: isActive ? 2 : 1,
        borderColor: isActive
          ? combatant.isPlayer
            ? "primary.main"
            : "error.main"
          : "divider",
        bgcolor: isActive ? "action.selected" : "background.paper",
        "&:hover": onSelect
          ? {
              bgcolor: "action.hover",
            }
          : {},
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {/* Avatar */}
        <EntityAvatar entity={avatarEntity} disablePopup size={40} />

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="body2"
              fontWeight="bold"
              noWrap
              sx={{ flex: 1 }}
            >
              {combatant.name}
            </Typography>
            <Chip
              label={`Shot ${combatant.currentShot}`}
              size="small"
              color={combatant.isPlayer ? "primary" : "default"}
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
          </Stack>

          {/* Health bar */}
          <Box sx={{ mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={healthPercent}
              color={getHealthColor()}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary">
              {combatant.wounds}/{combatant.maxWounds} wounds
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  )
}
