"use client"

import React, { useMemo } from "react"
import { Box, Typography, Collapse, Paper, Badge } from "@mui/material"
import { Healing as HealIcon } from "@mui/icons-material"
import {
  FaGun,
  FaRocket,
  FaCar,
  FaDice,
  FaPersonRunning,
  FaHand,
} from "react-icons/fa6"
import { MenuButton } from "@/components/ui"
import type { Character, Vehicle } from "@/types"
import { CS, VS } from "@/services"
import { useEncounter } from "@/contexts"
import { getAllVisibleShots } from "./attacks/shotSorting"

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
  const { encounter } = useEncounter()

  // Count characters requiring Up Checks
  const upCheckCount = useMemo(() => {
    if (!encounter?.shots) return 0

    return getAllVisibleShots(encounter.shots).filter(shot => {
      const character = shot.character
      return character?.status?.includes("up_check_required")
    }).length
  }, [encounter?.shots])

  // Check if selected character requires an Up Check
  const selectedCharacterNeedsUpCheck = useMemo(() => {
    if (!selectedCharacter) return false
    return selectedCharacter.status?.includes("up_check_required") || false
  }, [selectedCharacter])

  // Count characters attempting to escape
  const escapingCount = useMemo(() => {
    if (!encounter?.shots) return 0

    return getAllVisibleShots(encounter.shots).filter(shot => {
      const character = shot.character
      return character?.status?.includes("cheesing_it")
    }).length
  }, [encounter?.shots])
  const handleAction = (action: string) => {
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

  const drivingVehicle = selectedCharacter
    ? (selectedCharacter as Character & { driving?: Vehicle }).driving
    : undefined

  const isDriving = !!drivingVehicle
  const isVehicleDefeated = drivingVehicle
    ? VS.isDefeated(drivingVehicle)
    : false

  // Mooks with zero count cannot take actions
  const isMookWithZeroCount =
    selectedCharacter &&
    CS.isMook(selectedCharacter) &&
    (selectedCharacter.count || 0) === 0

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
            disabled={
              !selectedCharacter || !hasAttackSkills || isMookWithZeroCount
            }
            title={
              !selectedCharacter
                ? "Select a character first"
                : isMookWithZeroCount
                  ? "All mooks defeated"
                  : "Attack"
            }
            isActive={activePanel === "attack"}
          >
            <FaGun size={20} />
          </MenuButton>

          {isDriving && !isVehicleDefeated && (
            <MenuButton
              onClick={() => handleAction("chase")}
              title={isMookWithZeroCount ? "All mooks defeated" : "Chase"}
              disabled={!selectedCharacter || isMookWithZeroCount}
              isActive={activePanel === "chase"}
            >
              <FaCar size={20} />
            </MenuButton>
          )}

          <MenuButton
            onClick={() => handleAction("boost")}
            disabled={!selectedCharacter || isMookWithZeroCount}
            title={
              !selectedCharacter
                ? "Select a character first"
                : isMookWithZeroCount
                  ? "All mooks defeated"
                  : "Boost"
            }
            isActive={activePanel === "boost"}
          >
            <FaRocket size={20} />
          </MenuButton>

          <MenuButton
            onClick={() => handleAction("heal")}
            disabled={!selectedCharacter || isMookWithZeroCount}
            title={
              !selectedCharacter
                ? "Select a character first"
                : isMookWithZeroCount
                  ? "All mooks defeated"
                  : "Heal"
            }
            isActive={activePanel === "heal"}
          >
            <HealIcon />
          </MenuButton>

          <MenuButton
            onClick={() => handleAction("cheese")}
            disabled={!selectedCharacter || isMookWithZeroCount}
            title={
              !selectedCharacter
                ? "Select a character first"
                : isMookWithZeroCount
                  ? "All mooks defeated"
                  : "Cheese It"
            }
            isActive={activePanel === "cheese"}
          >
            <FaPersonRunning size={20} />
          </MenuButton>

          <Badge badgeContent={escapingCount} color="error">
            <MenuButton
              onClick={() => handleAction("speedcheck")}
              disabled={escapingCount === 0 || !selectedCharacter}
              title={
                !selectedCharacter ? "Select a character first" : "Speed Check"
              }
              isActive={activePanel === "speedcheck"}
            >
              <FaHand size={20} />
            </MenuButton>
          </Badge>

          <Badge badgeContent={upCheckCount} color="warning">
            <MenuButton
              onClick={() => handleAction("upcheck")}
              disabled={!selectedCharacterNeedsUpCheck}
              title={
                !selectedCharacter
                  ? "Select a character first"
                  : "Perform Up Check"
              }
              isActive={activePanel === "upcheck"}
            >
              <FaDice size={20} />
            </MenuButton>
          </Badge>
        </Box>
      </Paper>
    </Collapse>
  )
}
