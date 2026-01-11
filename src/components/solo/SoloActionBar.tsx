"use client"

import { useState } from "react"
import {
  Box,
  Paper,
  Stack,
  Button,
  ButtonGroup,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import StopIcon from "@mui/icons-material/Stop"
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi"
import ShieldIcon from "@mui/icons-material/Shield"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import SkipNextIcon from "@mui/icons-material/SkipNext"
import { useSoloEncounter, Combatant } from "@/contexts/SoloEncounterContext"

interface SoloActionBarProps {
  selectedTarget?: Combatant | null
  onClearTarget?: () => void
}

export function SoloActionBar({
  selectedTarget,
  onClearTarget,
}: SoloActionBarProps) {
  const {
    currentTurn,
    isProcessing,
    serverRunning,
    startServer,
    stopServer,
    advanceTurn,
    takeAction,
  } = useSoloEncounter()

  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  const handleStartServer = async () => {
    await startServer()
  }

  const handleStopServer = async () => {
    await stopServer()
  }

  const handleAction = async (actionType: "attack" | "defend" | "stunt") => {
    if (actionType === "attack" && !selectedTarget) {
      return // Need a target for attack
    }

    setActionInProgress(actionType)
    try {
      await takeAction({
        type: actionType,
        targetId: selectedTarget?.id,
      })
      onClearTarget?.()
    } finally {
      setActionInProgress(null)
    }
  }

  const handleAdvanceTurn = async () => {
    setActionInProgress("advance")
    try {
      await advanceTurn()
    } finally {
      setActionInProgress(null)
    }
  }

  const isDisabled = isProcessing || actionInProgress !== null

  // Server not running - show start button
  if (!serverRunning) {
    return (
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="body1" color="text.secondary">
            Solo play server not running
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartServer}
            disabled={isProcessing}
          >
            Start Encounter
          </Button>
        </Stack>
      </Paper>
    )
  }

  // NPC turn - show waiting message
  if (currentTurn === "npc") {
    return (
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          {isProcessing ? (
            <>
              <CircularProgress size={20} />
              <Typography variant="body1">NPC is acting...</Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary">
                NPC turn - waiting for action
              </Typography>
              <Button
                variant="outlined"
                startIcon={<SkipNextIcon />}
                onClick={handleAdvanceTurn}
                disabled={isDisabled}
              >
                Process NPC Turn
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleStopServer}
            disabled={isProcessing}
          >
            Stop
          </Button>
        </Stack>
      </Paper>
    )
  }

  // Player turn - show action buttons
  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Target indicator */}
        <Box sx={{ minWidth: 150 }}>
          {selectedTarget ? (
            <Typography variant="body2">
              Target: <strong>{selectedTarget.name}</strong>
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a target to attack
            </Typography>
          )}
        </Box>

        {/* Action buttons */}
        <ButtonGroup variant="contained" disabled={isDisabled}>
          <Tooltip
            title={
              !selectedTarget
                ? "Select a target first"
                : "Attack the selected target"
            }
          >
            <span>
              <Button
                startIcon={
                  actionInProgress === "attack" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SportsKabaddiIcon />
                  )
                }
                onClick={() => handleAction("attack")}
                disabled={isDisabled || !selectedTarget}
                color="error"
              >
                Attack
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Take a defensive action">
            <Button
              startIcon={
                actionInProgress === "defend" ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <ShieldIcon />
                )
              }
              onClick={() => handleAction("defend")}
              disabled={isDisabled}
              color="primary"
            >
              Defend
            </Button>
          </Tooltip>
          <Tooltip title="Perform a stunt">
            <Button
              startIcon={
                actionInProgress === "stunt" ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AutoFixHighIcon />
                )
              }
              onClick={() => handleAction("stunt")}
              disabled={isDisabled}
              color="secondary"
            >
              Stunt
            </Button>
          </Tooltip>
        </ButtonGroup>

        {/* Server control */}
        <Button
          variant="outlined"
          color="error"
          startIcon={<StopIcon />}
          onClick={handleStopServer}
          disabled={isProcessing}
          size="small"
        >
          Stop
        </Button>
      </Stack>
    </Paper>
  )
}
