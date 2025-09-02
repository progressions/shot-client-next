"use client"

import { Stack, IconButton, Popover, Box, Typography } from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import DeleteIcon from "@mui/icons-material/Delete"
import { useState, useMemo, useRef, useEffect } from "react"
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
  success: "success",
}

export default function CharacterEffectsDisplay({
  character,
  effects = [],
}: CharacterEffectsDisplayProps) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { user } = useApp()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [openSeverity, setOpenSeverity] = useState<Severity | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  // Timeout refs for delayed open/close
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isGamemaster = user?.gamemaster

  // Group effects by severity
  const groupedEffects = useMemo(() => {
    return effects.reduce(
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
  }, [effects])

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement>,
    severity: Severity
  ) => {
    // Capture the element immediately before it becomes null
    const element = event.currentTarget

    // Clear any existing close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    // Set a timeout to open the popover after 500ms
    openTimeoutRef.current = setTimeout(() => {
      setAnchorEl(element)
      setOpenSeverity(severity)
    }, 500)
  }

  const handlePopoverClose = () => {
    // Clear any existing open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }

    // Set a timeout to close the popover after 200ms
    closeTimeoutRef.current = setTimeout(() => {
      setAnchorEl(null)
      setOpenSeverity(null)
    }, 200)
  }

  const handlePopoverMouseEnter = () => {
    // Cancel close timeout when entering the popover
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    // Cancel open timeout as well since we're already open
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current)
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <Box
        component="span"
        sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}
      >
        {severityOrder.map(severity => {
          const severityEffects = groupedEffects[severity]
          if (!severityEffects || severityEffects.length === 0) return null

          return (
            <IconButton
              key={severity}
              size="small"
              color={severityColors[severity] as any}
              onMouseEnter={e => handlePopoverOpen(e, severity)}
              onMouseLeave={handlePopoverClose}
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
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        disableRestoreFocus
        disableScrollLock
        sx={{
          pointerEvents: "none",
        }}
      >
        {openSeverity && groupedEffects[openSeverity] && (
          <Box
            sx={{ p: 1.5, minWidth: 200, pointerEvents: "auto" }}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverClose}
          >
            {groupedEffects[openSeverity].map((effect, index) => (
              <Stack
                key={effect.id || index}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  py: 0.5,
                  borderBottom:
                    index < groupedEffects[openSeverity].length - 1
                      ? "1px solid"
                      : "none",
                  borderColor: "divider",
                }}
              >
                <InfoOutlinedIcon
                  fontSize="small"
                  color={severityColors[openSeverity] as any}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    {effect.name}
                    {effect.action_value && effect.change && (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ ml: 1, fontWeight: "bold" }}
                      >
                        ({formatChange(effect)})
                      </Typography>
                    )}
                  </Typography>
                </Box>
                {isGamemaster && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteEffect(effect)}
                    sx={{ padding: 0.25 }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Stack>
            ))}
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
