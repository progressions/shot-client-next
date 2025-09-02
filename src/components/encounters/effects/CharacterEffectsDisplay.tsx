"use client"

import { Stack, IconButton, Popover, Box, Typography, Chip } from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import DeleteIcon from "@mui/icons-material/Delete"
import { useState, useMemo } from "react"
import type { Character, CharacterEffect } from "@/types"
import { useEncounter, useToast, useClient, useApp } from "@/contexts"
import AddEffectModal from "./AddEffectModal"

interface CharacterEffectsDisplayProps {
  character: Character
  effects?: CharacterEffect[]
}

type Severity = "error" | "warning" | "info" | "success"

const severityColors: Record<Severity, string> = {
  error: "error",
  warning: "warning", 
  info: "info",
  success: "success"
}

export default function CharacterEffectsDisplay({ character, effects = [] }: CharacterEffectsDisplayProps) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { user } = useApp()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [openSeverity, setOpenSeverity] = useState<Severity | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const isGamemaster = user?.gamemaster

  // Group effects by severity
  const groupedEffects = useMemo(() => {
    return effects.reduce((acc, effect) => {
      const severity = effect.severity as Severity
      if (!acc[severity]) {
        acc[severity] = []
      }
      acc[severity].push(effect)
      return acc
    }, {} as Record<Severity, CharacterEffect[]>)
  }, [effects])

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, severity: Severity) => {
    setAnchorEl(event.currentTarget)
    setOpenSeverity(severity)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
    setOpenSeverity(null)
  }

  const handleDeleteEffect = async (effect: CharacterEffect) => {
    // Optimistically remove the effect from the character
    if (character.effects) {
      character.effects = character.effects.filter(e => e.id !== effect.id)
    }
    
    // Close the popover since we're removing an effect
    handlePopoverClose()
    
    try {
      await client.deleteCharacterEffect(encounter, effect)
      toastSuccess(`Removed effect: ${effect.name}`)
      
      // Touch the fight to trigger websocket update
      await client.touchFight(encounter)
    } catch (error) {
      // On error, we should restore the effect, but since websocket will update anyway, we'll let it handle it
      toastError("Failed to remove effect")
      console.error(error)
    }
  }

  const actionValueLabel = (effect: CharacterEffect) => {
    if (effect.action_value === "MainAttack") {
      return "Attack"
    }
    return effect.action_value || ""
  }

  const formatChange = (effect: CharacterEffect) => {
    if (!effect.change) return ""
    // If change starts with + or -, it's a modifier
    if (effect.change.startsWith("+") || effect.change.startsWith("-")) {
      return `${actionValueLabel(effect)} ${effect.change}`
    }
    // Otherwise it's an absolute value
    return `${actionValueLabel(effect)} = ${effect.change}`
  }

  const severityOrder: Severity[] = ["error", "warning", "info", "success"]

  return (
    <>
      <Box component="span" sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}>
        {severityOrder.map(severity => {
          const severityEffects = groupedEffects[severity]
          if (!severityEffects || severityEffects.length === 0) return null

          return (
            <IconButton
              key={severity}
              size="small"
              color={severityColors[severity] as any}
              onMouseEnter={(e) => handlePopoverOpen(e, severity)}
              sx={{ padding: 0.5 }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          )
        })}
        
        {isGamemaster && (
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setAddModalOpen(true)}
            sx={{ padding: 0.5 }}
          >
            <AddCircleOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Popover
        open={Boolean(anchorEl && openSeverity)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        disableRestoreFocus
        sx={{
          pointerEvents: "auto"
        }}
        slotProps={{
          paper: {
            onMouseEnter: () => {
              // Keep popover open when hovering over it
            },
            onMouseLeave: handlePopoverClose
          }
        }}
      >
        {openSeverity && groupedEffects[openSeverity] && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold" }}>
              Active Effects
            </Typography>
            <Stack spacing={1}>
              {groupedEffects[openSeverity].map((effect, index) => (
                <Box key={effect.id || index}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {effect.name}
                      </Typography>
                      {effect.description && (
                        <Typography variant="caption" color="text.secondary">
                          {effect.description}
                        </Typography>
                      )}
                      {effect.action_value && effect.change && (
                        <Chip
                          label={formatChange(effect)}
                          size="small"
                          color={severityColors[openSeverity] as any}
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                    {isGamemaster && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEffect(effect)}
                        sx={{ padding: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Popover>

      {isGamemaster && (
        <AddEffectModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          character={character}
        />
      )}
    </>
  )
}