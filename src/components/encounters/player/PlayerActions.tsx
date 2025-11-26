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
  DirectionsRun,
  Favorite,
  FlashOn,
  SportsMartialArts,
  AccessTime,
  AutoAwesome,
} from "@mui/icons-material"
import type { Character } from "@/types"
import {
  AttackPanel,
  BoostPanel,
  CheeseItPanel,
  HealPanel,
  SpendShotsPanel,
  FortunePanel,
} from "@/components/encounters"
import { CS } from "@/services"

interface PlayerActionsProps {
  character: Character
}

type ActionType =
  | "attack"
  | "boost"
  | "cheese"
  | "heal"
  | "wait"
  | "fortune"
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
        py: 1,
        px: 0.5,
        gap: 0.25,
        borderColor: isActive ? "primary.main" : "divider",
        backgroundColor: isActive ? "primary.main" : "background.paper",
        color: isActive ? "primary.contrastText" : "text.primary",
        "&:hover": {
          backgroundColor: isActive ? "primary.dark" : "action.hover",
          borderColor: "primary.main",
        },
        "&:disabled": {
          backgroundColor: "action.disabledBackground",
          borderColor: "divider",
          color: "text.disabled",
        },
      }}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.6rem",
          lineHeight: 1,
          textTransform: "none",
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
      case "fortune":
        return <FortunePanel character={character} onComplete={handleClose} />
      default:
        return null
    }
  }

  // Determine which actions are available
  const hasAttackSkills = useMemo(() => {
    if (!character || !character.action_values) return false
    return (
      (character.action_values["Martial Arts"] as number) > 0 ||
      (character.action_values["Guns"] as number) > 0 ||
      (character.action_values["Sorcery"] as number) > 0 ||
      (character.action_values["Creature"] as number) > 0
    )
  }, [character])

  const canUseFortune = useMemo(() => {
    if (!character) return false
    return CS.isPC(character) && CS.fortune(character) > 0
  }, [character])

  return (
    <Box sx={{ p: 1 }}>
      {/* Action Buttons Grid */}
      <Box
        data-testid="player-action-bar"
        sx={{
          p: 1,
          backgroundColor: "background.paper",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          gap: 0.5,
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
          onClick={() => handleAction("fortune")}
          disabled={!character || !canUseFortune}
          isActive={activeAction === "fortune"}
          icon={<AutoAwesome sx={{ fontSize: 20 }} />}
          label="Fortune"
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
