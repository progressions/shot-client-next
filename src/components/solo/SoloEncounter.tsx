"use client"

import { useState } from "react"
import { Box, Grid, Typography, Paper, Button } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Link from "next/link"
import {
  SoloEncounterProvider,
  Combatant,
} from "@/contexts/SoloEncounterContext"
import { NarrativeScroll } from "./NarrativeScroll"
import { CombatantsSidebar } from "./CombatantsSidebar"
import { SoloActionBar } from "./SoloActionBar"
import type { Fight } from "@/types"

interface SoloEncounterProps {
  fight: Fight
  campaignId: string
}

function SoloEncounterContent({ fight, campaignId }: SoloEncounterProps) {
  const [selectedTarget, setSelectedTarget] = useState<Combatant | null>(null)

  const handleSelectTarget = (combatant: Combatant) => {
    // Only allow selecting NPCs as targets (not player characters)
    if (!combatant.isPlayer) {
      setSelectedTarget(combatant)
    }
  }

  const handleClearTarget = () => {
    setSelectedTarget(null)
  }

  return (
    <Box
      sx={{ height: "100vh", display: "flex", flexDirection: "column", p: 2 }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Button
            component={Link}
            href={`/campaigns/${campaignId}/fights`}
            startIcon={<ArrowBackIcon />}
            size="small"
          >
            Back to Fights
          </Button>
          <Typography variant="h5" component="h1">
            {fight.name}
          </Typography>
        </Box>
        {fight.description && (
          <Typography variant="body2" color="text.secondary">
            {fight.description}
          </Typography>
        )}
      </Box>

      {/* Main content area */}
      <Box sx={{ flex: 1, minHeight: 0, mb: 2 }}>
        <Grid container spacing={2} sx={{ height: "100%" }}>
          {/* Narrative panel (left/main) */}
          <Grid size={{ xs: 12, md: 8 }}>
            <NarrativeScroll />
          </Grid>

          {/* Combatants sidebar (right) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <CombatantsSidebar
              selectedTargetId={selectedTarget?.id}
              onSelectTarget={handleSelectTarget}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Action bar (bottom) */}
      <SoloActionBar
        selectedTarget={selectedTarget}
        onClearTarget={handleClearTarget}
      />
    </Box>
  )
}

export function SoloEncounter({ fight, campaignId }: SoloEncounterProps) {
  // Verify this is a solo mode fight
  if (!fight.solo_mode) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Paper sx={{ p: 4, maxWidth: 500, mx: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Not a Solo Fight
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            This fight is not configured for solo play mode.
          </Typography>
          <Button
            component={Link}
            href={`/campaigns/${campaignId}/encounters/${fight.id}`}
            variant="contained"
          >
            View in Standard Mode
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <SoloEncounterProvider fight={fight}>
      <SoloEncounterContent fight={fight} campaignId={campaignId} />
    </SoloEncounterProvider>
  )
}
