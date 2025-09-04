"use client"

import React from "react"
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Paper,
  Chip,
} from "@mui/material"
import {
  Healing as HealIcon,
} from "@mui/icons-material"
import {
  FaGun,
  FaRocket,
  FaCar,
} from "react-icons/fa6"
import { useEncounter } from "@/contexts"
import { CS } from "@/services"
import type { Character } from "@/types"

interface EncounterActionBarProps {
  selectedCharacter: Character | null
  onAction: (action: string) => void
}

export default function EncounterActionBar({
  selectedCharacter,
  onAction,
}: EncounterActionBarProps) {
  const { selectedActorShot } = useEncounter()

  if (!selectedCharacter) {
    return null
  }

  const handleAction = (action: string) => {
    onAction(action)
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
          p: { xs: 1, sm: 2 },
          mb: { xs: 1, sm: 2 },
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          flexWrap: "wrap",
        }}
      >
        {/* Character Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 }, flex: "0 1 auto" }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: "bold",
              fontSize: { xs: "1rem", sm: "1.25rem" }
            }}
          >
            {selectedCharacter.name}
          </Typography>
          <Chip
            label={`Shot ${selectedActorShot}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ display: { xs: "none", sm: "flex" } }}
          />
          <Chip
            label={CS.type(selectedCharacter)}
            size="small"
            color="default"
            variant="outlined"
            sx={{ display: { xs: "none", sm: "flex" } }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ flex: "1 1 auto", display: "flex", gap: 1, ml: "auto", alignItems: "center" }}>
          <IconButton
            onClick={() => handleAction("attack")}
            disabled={!hasAttackSkills}
            color="error"
            title="Attack"
          >
            <FaGun size={20} />
          </IconButton>
          
          <IconButton
            onClick={() => handleAction("boost")}
            color="info"
            title="Boost"
          >
            <FaRocket size={20} />
          </IconButton>

          {isInChase && (
            <IconButton
              onClick={() => handleAction("chase")}
              color="warning"
              title="Chase"
            >
              <FaCar size={20} />
            </IconButton>
          )}

          <IconButton
            onClick={() => handleAction("heal")}
            color="success"
            title="Heal"
          >
            <HealIcon />
          </IconButton>

        </Box>
      </Paper>
    </Collapse>
  )
}