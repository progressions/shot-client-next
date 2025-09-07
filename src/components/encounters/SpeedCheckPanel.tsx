"use client"

import React, { useState, useMemo } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  IconButton,
  Grid,
} from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"
import { FaPersonRunning, FaDice } from "react-icons/fa6"
import { useEncounter } from "@/contexts"
import { useToast } from "@/contexts"
import { CS } from "@/services"
import { CharacterLink } from "@/components/ui/links"
import { Avatar } from "@/components/avatars"
import { NumberField } from "@/components/ui"
import { getAllVisibleShots } from "./attacks/shotSorting"
import type { Character } from "@/types"

interface SpeedCheckPanelProps {
  onClose: () => void
  onComplete: () => void
}

export default function SpeedCheckPanel({
  onClose,
  onComplete,
}: SpeedCheckPanelProps) {
  const { encounter, applyCharacterUpdates } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [selectedPreventer, setSelectedPreventer] = useState<Character | null>(
    null
  )
  const [swerve, setSwerve] = useState<number>(0)

  // Get all characters attempting to escape
  const escapingCharacters = useMemo(() => {
    if (!encounter?.shots) return []

    const allShots = getAllVisibleShots(encounter.shots)
    return allShots
      .filter(shot => shot.character?.status?.includes("cheesing_it"))
      .map(shot => ({
        character: shot.character!,
        shot: shot.shot,
      }))
      .sort((a, b) => (b.shot || 0) - (a.shot || 0)) // Highest shot first
  }, [encounter?.shots])

  // Get characters eligible to prevent escape
  const eligiblePreventers = useMemo(() => {
    if (!encounter?.shots || escapingCharacters.length === 0) return []

    const allShots = getAllVisibleShots(encounter.shots)
    const highestEscapingShot = Math.max(
      ...escapingCharacters.map(e => e.shot || 0)
    )

    // Characters acting after the escaping character(s) can attempt prevention
    return allShots
      .filter(shot => {
        const char = shot.character
        if (!char) return false
        // Must be acting after the highest escaping character
        if ((shot.shot || 0) >= highestEscapingShot) return false
        // Cannot already be escaping or escaped
        if (
          char.status?.includes("cheesing_it") ||
          char.status?.includes("cheesed_it")
        )
          return false
        return true
      })
      .map(shot => ({
        character: shot.character!,
        shot: shot.shot,
      }))
      .sort((a, b) => (b.shot || 0) - (a.shot || 0)) // Highest shot first
  }, [encounter?.shots, escapingCharacters])

  const handlePreventEscape = async () => {
    if (!selectedPreventer || escapingCharacters.length === 0 || !encounter)
      return

    setSubmitting(true)
    try {
      // Get the target escaper (highest shot among escaping characters)
      const targetEscaper = escapingCharacters[0]

      // Calculate Speed Check difficulty
      const escapeeDifficulty = CS.speed(targetEscaper.character) || 5
      const roll = swerve

      const success = roll >= escapeeDifficulty

      const characterUpdates = []

      if (success) {
        // Prevention succeeds - remove cheesing_it status
        characterUpdates.push({
          character_id: targetEscaper.character.id,
          remove_status: ["cheesing_it"],
          event: {
            type: "escape_prevented",
            description: `${selectedPreventer.name} prevents ${targetEscaper.character.name} from escaping!`,
            details: {
              preventer_id: selectedPreventer.id,
              escapee_id: targetEscaper.character.id,
              roll: roll,
              difficulty: escapeeDifficulty,
              success: true,
            },
          },
        })
        toastSuccess(`${selectedPreventer.name} prevents the escape!`)
      } else {
        // Prevention fails - escapee becomes "cheesed_it"
        characterUpdates.push({
          character_id: targetEscaper.character.id,
          remove_status: ["cheesing_it"],
          add_status: ["cheesed_it"],
          event: {
            type: "escape_succeeded",
            description: `${targetEscaper.character.name} successfully escapes!`,
            details: {
              preventer_id: selectedPreventer.id,
              escapee_id: targetEscaper.character.id,
              roll: roll,
              difficulty: escapeeDifficulty,
              success: false,
            },
          },
        })
        toastSuccess(`${targetEscaper.character.name} escapes!`)
      }

      // Apply the updates
      await applyCharacterUpdates(characterUpdates)
      onComplete()
    } catch (error) {
      console.error("Failed to prevent escape:", error)
      toastError("Failed to process escape prevention")
    } finally {
      setSubmitting(false)
    }
  }

  if (escapingCharacters.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          mb: 2,
          position: "relative",
          border: "2px solid",
          borderColor: "info.main",
          backgroundColor: "background.paper",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <FaDice size={24} />
          <Typography variant="h6" component="h2">
            Speed Check
          </Typography>
        </Box>

        <Alert severity="info">
          No characters are currently attempting to escape.
        </Alert>
      </Paper>
    )
  }

  const targetEscaper = escapingCharacters[0]

  return (
    <Paper
      sx={{
        p: 3,
        mb: 2,
        position: "relative",
        border: "2px solid",
        borderColor: "warning.main",
        backgroundColor: "background.paper",
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
        size="small"
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FaDice size={24} />
        <Typography variant="h6" component="h2">
          Speed Check - Prevent Escape
        </Typography>
      </Box>

      {/* Escaping Character Display */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Attempting to Escape:
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar character={targetEscaper.character} hideVehicle size={48} />
          <Box>
            <CharacterLink character={targetEscaper.character} />
            <Typography variant="body2" color="text.secondary">
              Speed: {CS.speed(targetEscaper.character)} (Difficulty)
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Preventer Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Select Character to Prevent Escape:
        </Typography>

        {eligiblePreventers.length === 0 ? (
          <Alert severity="warning">
            No characters are eligible to prevent the escape. Only characters
            acting after the escaping character can attempt prevention.
          </Alert>
        ) : (
          <Grid container spacing={1}>
            {eligiblePreventers.map(({ character, shot }) => (
              <Grid item xs={12} sm={6} key={character.id}>
                <Button
                  variant={
                    selectedPreventer?.id === character.id
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setSelectedPreventer(character)}
                  sx={{
                    justifyContent: "flex-start",
                    width: "100%",
                    p: 1,
                  }}
                >
                  <Avatar
                    character={character}
                    hideVehicle
                    size={32}
                    sx={{ mr: 1 }}
                  />
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2">{character.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Shot {shot} • Speed {CS.speed(character)}
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Speed Check Resolution */}
      {selectedPreventer && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Roll Speed Check:
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <NumberField
              name="swerve"
              label="Swerve"
              value={swerve}
              onChange={e => setSwerve(parseInt(e.target.value) || 0)}
              width="80px"
            />
            <Typography variant="body2">
              vs Difficulty {CS.speed(targetEscaper.character)}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePreventEscape}
              disabled={submitting}
              startIcon={<FaDice />}
            >
              {submitting ? "Processing..." : "Resolve Speed Check"}
            </Button>
            <Button variant="outlined" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  )
}
