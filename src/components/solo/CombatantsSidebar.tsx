"use client"

import { Box, Paper, Stack, Typography, Divider } from "@mui/material"
import { useSoloEncounter, Combatant } from "@/contexts/SoloEncounterContext"
import { CombatantCard } from "./CombatantCard"

interface CombatantsSidebarProps {
  selectedTargetId?: string | null
  onSelectTarget?: (combatant: Combatant) => void
}

export function CombatantsSidebar({
  selectedTargetId: _selectedTargetId,
  onSelectTarget,
}: CombatantsSidebarProps) {
  const { combatants, currentTurn } = useSoloEncounter()

  // Separate PCs and NPCs
  const playerCombatants = combatants.filter(c => c.isPlayer)
  const npcCombatants = combatants.filter(c => !c.isPlayer)

  // Find the active combatant (highest shot)
  const activeCombatant = combatants[0]

  return (
    <Paper
      sx={{
        p: 2,
        height: { xs: "auto", md: "70vh" },
        overflow: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Combatants
      </Typography>

      {/* Player Characters */}
      <Typography
        variant="subtitle2"
        color="primary"
        sx={{ mt: 1, mb: 1, fontWeight: "bold" }}
      >
        Player Characters
      </Typography>
      <Stack spacing={1}>
        {playerCombatants.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No player characters
          </Typography>
        ) : (
          playerCombatants.map(combatant => (
            <CombatantCard
              key={combatant.id}
              combatant={combatant}
              isActive={activeCombatant?.id === combatant.id}
              onSelect={currentTurn === "player" ? onSelectTarget : undefined}
            />
          ))
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* NPCs */}
      <Typography
        variant="subtitle2"
        color="error"
        sx={{ mb: 1, fontWeight: "bold" }}
      >
        Enemies
      </Typography>
      <Stack spacing={1}>
        {npcCombatants.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No enemies
          </Typography>
        ) : (
          npcCombatants.map(combatant => (
            <CombatantCard
              key={combatant.id}
              combatant={combatant}
              isActive={activeCombatant?.id === combatant.id}
              onSelect={currentTurn === "player" ? onSelectTarget : undefined}
            />
          ))
        )}
      </Stack>

      {/* Shot order legend */}
      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary">
          Sorted by shot order (highest first)
        </Typography>
      </Box>
    </Paper>
  )
}
