"use client"

import { useState, useMemo } from "react"
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Typography,
  Button,
} from "@mui/material"
import {
  Close,
  DirectionsCar,
  DirectionsRun,
  Favorite,
  FlashOn,
  SportsMartialArts,
  AccessTime,
} from "@mui/icons-material"
import type { Character, Vehicle } from "@/types"
import {
  AttackPanel,
  BoostPanel,
  ChasePanel,
  CheeseItPanel,
  HealPanel,
  SpendShotsPanel,
} from "@/components/encounters"
import { VS } from "@/services"

interface PlayerActionsProps {
  character: Character
}

type ActionType =
  | "attack"
  | "chase"
  | "boost"
  | "cheese"
  | "heal"
  | "wait"
  | null

interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  isActive?: boolean
  icon: React.ReactNode
  label: string
}

function ActionButton({
  onClick,
  disabled,
  isActive,
  icon,
  label,
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={isActive ? "contained" : "outlined"}
      sx={{
        flex: 1,
        minWidth: 0,
        flexDirection: "column",
        py: 1.25,
        px: 0.5,
        gap: 0.5,
        borderRadius: 2,
        borderColor: isActive ? "#f59e0b" : "rgba(255, 255, 255, 0.1)",
        backgroundColor: isActive
          ? "rgba(245, 158, 11, 0.9)"
          : "rgba(26, 26, 26, 0.8)",
        color: isActive ? "#0a0a0a" : "#d4d4d8",
        boxShadow: isActive
          ? "0 4px 12px rgba(245, 158, 11, 0.3)"
          : "inset 0 1px 2px rgba(0,0,0,0.2)",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: isActive ? "#f59e0b" : "rgba(245, 158, 11, 0.15)",
          borderColor: "#f59e0b",
          color: isActive ? "#0a0a0a" : "#fafafa",
          transform: "translateY(-1px)",
        },
        "&:disabled": {
          backgroundColor: "rgba(15, 15, 15, 0.8)",
          borderColor: "rgba(255, 255, 255, 0.05)",
          color: "#52525b",
          boxShadow: "none",
        },
      }}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.65rem",
          lineHeight: 1,
          textTransform: "none",
          fontWeight: 600,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>
    </Button>
  )
}

export default function PlayerActions({ character }: PlayerActionsProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null)
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"))

  const handleClose = () => {
    setActiveAction(null)
  }

  const handleAction = (action: ActionType) => {
    setActiveAction(action)
  }

  const renderActivePanel = () => {
    switch (activeAction) {
      case "attack":
        return (
          <AttackPanel
            preselectedAttacker={character}
            onComplete={handleClose}
          />
        )
      case "chase":
        return (
          <ChasePanel
            preselectedCharacter={character}
            onComplete={handleClose}
          />
        )
      case "boost":
        return (
          <BoostPanel preselectedBooster={character} onComplete={handleClose} />
        )
      case "cheese":
        return (
          <CheeseItPanel
            preselectedCharacter={character}
            onComplete={handleClose}
          />
        )
      case "heal":
        return (
          <HealPanel
            preselectedCharacter={character}
            onComplete={handleClose}
          />
        )
      case "wait":
        return (
          <SpendShotsPanel character={character} onComplete={handleClose} />
        )
      default:
        return null
    }
  }

  // Determine which actions are available
  // Action values default to 7 if not set
  const hasAttackSkills = useMemo(() => {
    if (!character || !character.action_values) return false
    return (
      (character.action_values["Martial Arts"] ?? 7) > 0 ||
      (character.action_values["Guns"] ?? 7) > 0 ||
      (character.action_values["Sorcery"] ?? 7) > 0 ||
      (character.action_values["Creature"] ?? 7) > 0
    )
  }, [character])

  // Check if character is driving a vehicle and can chase
  const drivingVehicle = (character as Character & { driving?: Vehicle })
    .driving
  const canChase = useMemo(() => {
    if (!character || !drivingVehicle) return false
    return !VS.isDefeated(drivingVehicle)
  }, [character, drivingVehicle])

  return (
    <Box sx={{ p: 1 }}>
      {/* Action Buttons Grid */}
      <Box
        data-testid="player-action-bar"
        sx={{
          p: 1.5,
          background: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          gap: 0.75,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <ActionButton
          onClick={() => handleAction("attack")}
          disabled={!character || !hasAttackSkills}
          isActive={activeAction === "attack"}
          icon={<SportsMartialArts sx={{ fontSize: 20 }} />}
          label="Attack"
        />

        <ActionButton
          onClick={() => handleAction("chase")}
          disabled={!character || !canChase}
          isActive={activeAction === "chase"}
          icon={<DirectionsCar sx={{ fontSize: 20 }} />}
          label="Chase"
        />

        <ActionButton
          onClick={() => handleAction("wait")}
          disabled={!character}
          isActive={activeAction === "wait"}
          icon={<AccessTime sx={{ fontSize: 20 }} />}
          label="Wait"
        />

        <ActionButton
          onClick={() => handleAction("boost")}
          disabled={!character}
          isActive={activeAction === "boost"}
          icon={<FlashOn sx={{ fontSize: 20 }} />}
          label="Boost"
        />

        <ActionButton
          onClick={() => handleAction("cheese")}
          disabled={!character}
          isActive={activeAction === "cheese"}
          icon={<DirectionsRun sx={{ fontSize: 20 }} />}
          label="Flee"
        />

        <ActionButton
          onClick={() => handleAction("heal")}
          disabled={!character}
          isActive={activeAction === "heal"}
          icon={<Favorite sx={{ fontSize: 20 }} />}
          label="Heal"
        />
      </Box>

      {/* Action Dialog */}
      <Dialog
        open={!!activeAction}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
      >
        {/* Close button for fullscreen mode */}
        {fullScreen && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
        )}

        <DialogContent sx={{ p: fullScreen ? 1 : 2 }}>
          {renderActivePanel()}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
