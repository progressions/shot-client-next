"use client"

import React from "react"
import { Box, Typography, Collapse, Paper } from "@mui/material"
import { Healing as HealIcon } from "@mui/icons-material"
import { FaGun, FaRocket, FaCar } from "react-icons/fa6"
import { MenuButton } from "@/components/ui"
import type { Character } from "@/types"

interface EncounterActionBarProps {
  selectedCharacter: Character | null
  onAction: (action: string) => void
  activePanel?: string | null
}

export default function EncounterActionBar({
  selectedCharacter,
  onAction,
  activePanel,
}: EncounterActionBarProps) {
  const handleAction = (action: string) => {
    // Scroll to top when opening a panel
    window.scrollTo({ top: 0, behavior: "smooth" })
    onAction(action)
  }

  // Determine which actions are available
  const hasAttackSkills =
    selectedCharacter &&
    selectedCharacter.action_values &&
    (selectedCharacter.action_values["Martial Arts"] !== undefined ||
      selectedCharacter.action_values["Guns"] !== undefined ||
      selectedCharacter.action_values["Sorcery"] !== undefined ||
      selectedCharacter.action_values["Creature"] !== undefined)

  const isDriving =
    selectedCharacter &&
    !!(selectedCharacter as Character & { driving?: boolean }).driving

  return (
    <Collapse in={true} timeout={300}>
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
            flex: "0 1 auto",
          }}
        >
          {selectedCharacter && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              {selectedCharacter.name}
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            flex: "1 1 auto",
            display: "flex",
            gap: 1,
            ml: "auto",
            alignItems: "center",
          }}
        >
          <MenuButton
            onClick={() => handleAction("attack")}
            disabled={!selectedCharacter || !hasAttackSkills}
            title={!selectedCharacter ? "Select a character first" : "Attack"}
            isActive={activePanel === "attack"}
          >
            <FaGun size={20} />
          </MenuButton>

          <MenuButton
            onClick={() => handleAction("chase")}
            title={
              !selectedCharacter
                ? "Select a character first"
                : isDriving
                  ? "Chase"
                  : "Character is not driving a vehicle"
            }
            disabled={!selectedCharacter || !isDriving}
            isActive={activePanel === "chase"}
          >
            <FaCar size={20} />
          </MenuButton>

          <MenuButton
            onClick={() => handleAction("boost")}
            disabled={!selectedCharacter}
            title={!selectedCharacter ? "Select a character first" : "Boost"}
            isActive={activePanel === "boost"}
          >
            <FaRocket size={20} />
          </MenuButton>

          <MenuButton
            onClick={() => handleAction("heal")}
            disabled={!selectedCharacter}
            title={!selectedCharacter ? "Select a character first" : "Heal"}
            isActive={activePanel === "heal"}
          >
            <HealIcon />
          </MenuButton>
        </Box>
      </Paper>
    </Collapse>
  )
}
