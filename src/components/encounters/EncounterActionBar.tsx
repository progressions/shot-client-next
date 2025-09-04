"use client"

import React from "react"
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  IconButton,
  Collapse,
  Paper,
  Chip,
} from "@mui/material"
import {
  Close as CloseIcon,
  SportsMma as AttackIcon,
  Shield as ShieldIcon,
  DirectionsCar as ChaseIcon,
  Healing as HealIcon,
  Timer as TimerIcon,
} from "@mui/icons-material"
import { useEncounter } from "@/contexts"
import { CS } from "@/services"
import type { Character } from "@/types"

interface EncounterActionBarProps {
  selectedCharacter: Character | null
  onAction: (action: string, character: Character) => void
}

export default function EncounterActionBar({
  selectedCharacter,
  onAction,
}: EncounterActionBarProps) {
  const { selectedActorShot, setSelectedActor } = useEncounter()

  if (!selectedCharacter) {
    return null
  }

  const handleClearSelection = () => {
    setSelectedActor(null, null)
  }

  const handleAction = (action: string) => {
    onAction(action, selectedCharacter)
  }

  // Determine which actions are available
  const hasAttackSkills = 
    selectedCharacter.action_values &&
    (selectedCharacter.action_values["Martial Arts"] ||
     selectedCharacter.action_values["Guns"] ||
     selectedCharacter.action_values["Sorcery"] ||
     selectedCharacter.action_values["Creature"])

  const hasWounds = (selectedCharacter.wounds || 0) > 0
  const isInChase = selectedCharacter.chase_points !== undefined
  
  return (
    <Collapse in={!!selectedCharacter} timeout={300}>
      <Paper
        data-testid="encounter-action-bar"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          p: 2,
          mb: 2,
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Character Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: "0 1 auto" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {selectedCharacter.name}
          </Typography>
          <Chip
            label={`Shot ${selectedActorShot}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={CS.type(selectedCharacter)}
            size="small"
            color="default"
            variant="outlined"
          />
        </Box>

        {/* Action Buttons */}
        <ButtonGroup
          variant="contained"
          sx={{ flex: "1 1 auto", display: "flex", gap: 1 }}
        >
          <Button
            startIcon={<AttackIcon />}
            onClick={() => handleAction("attack")}
            disabled={!hasAttackSkills}
            color="error"
          >
            Attack
          </Button>
          
          <Button
            startIcon={<ShieldIcon />}
            onClick={() => handleAction("boost")}
            color="info"
          >
            Boost
          </Button>

          {isInChase && (
            <Button
              startIcon={<ChaseIcon />}
              onClick={() => handleAction("chase")}
              color="warning"
            >
              Chase
            </Button>
          )}

          {hasWounds && (
            <Button
              startIcon={<HealIcon />}
              onClick={() => handleAction("heal")}
              color="success"
            >
              Heal
            </Button>
          )}

          <Button
            startIcon={<TimerIcon />}
            onClick={() => handleAction("other")}
            color="inherit"
          >
            Other
          </Button>
        </ButtonGroup>

        {/* Close Button */}
        <IconButton
          aria-label="Clear selection"
          onClick={handleClearSelection}
          sx={{ ml: "auto" }}
        >
          <CloseIcon />
        </IconButton>
      </Paper>
    </Collapse>
  )
}