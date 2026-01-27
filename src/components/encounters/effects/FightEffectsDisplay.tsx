"use client"

import { Stack, IconButton, Popover, Box, Typography } from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import DeleteIcon from "@mui/icons-material/Delete"
import { useState, useMemo, useRef, useEffect } from "react"
import type { Effect, Encounter } from "@/types"
import { useToast, useClient, useApp } from "@/contexts"
import AddFightEffectModal from "./AddFightEffectModal"

interface FightEffectsDisplayProps {
  encounter: Encounter
  effects?: Effect[]
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

export default function FightEffectsDisplay({
  encounter,
  effects = [],
}: FightEffectsDisplayProps) {
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
      {} as Record<Severity, Effect[]>
    )
  }, [effects])

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement>,
    severity: Severity
  ) => {
    const element = event.currentTarget

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    openTimeoutRef.current = setTimeout(() => {
      setAnchorEl(element)
      setOpenSeverity(severity)
    }, 500)
  }

  const handlePopoverClose = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }

    closeTimeoutRef.current = setTimeout(() => {
      setAnchorEl(null)
      setOpenSeverity(null)
    }, 200)
  }

  const handlePopoverMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
  }

  const handleDeleteEffect = async (effect: Effect) => {
    handlePopoverClose()

    try {
      await client.deleteEffect(encounter, effect)
      toastSuccess(`Removed effect: ${effect.name || "Effect"}`)
      await client.touchFight(encounter)
    } catch (error) {
      toastError("Failed to remove effect")
      console.error(error)
    }
  }

  const formatExpiry = (effect: Effect) => {
    if (effect.end_sequence == null && effect.end_shot == null) {
      return "No expiry"
    }
    const parts = []
    if (effect.end_sequence != null) {
      parts.push(`Seq ${effect.end_sequence}`)
    }
    if (effect.end_shot != null) {
      parts.push(`Shot ${effect.end_shot}`)
    }
    return `Expires: ${parts.join(", ")}`
  }

  const severityOrder: Severity[] = ["error", "warning", "info", "success"]

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
        sx={{ display: "inline-flex", gap: 0.5, alignItems: "center", ml: 1 }}
      >
        {severityOrder.map(severity => {
          const severityEffects = groupedEffects[severity]
          if (!severityEffects || severityEffects.length === 0) return null

          return (
            <IconButton
              key={severity}
              size="small"
              color={severityColors[severity]}
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
            title="Add fight effect"
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
            sx={{ p: 1.5, minWidth: 250, pointerEvents: "auto" }}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverClose}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              Fight Effects
            </Typography>
            {groupedEffects[openSeverity].map((effect, index) => (
              <Stack
                key={effect.id || index}
                direction="row"
                alignItems="flex-start"
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
                  color={severityColors[openSeverity]}
                  sx={{ mt: 0.25 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {effect.name || "Unnamed Effect"}
                  </Typography>
                  {effect.description && (
                    <Typography variant="caption" color="text.secondary">
                      {effect.description}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {formatExpiry(effect)}
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
        <AddFightEffectModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          encounter={encounter}
        />
      )}
    </>
  )
}
