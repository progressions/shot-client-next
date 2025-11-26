"use client"

import { useMemo, useEffect } from "react"
import { Box, Typography, Paper, IconButton } from "@mui/material"
import { useEncounter } from "@/contexts"
import { getAllVisibleShots } from "@/components/encounters/attacks/shotSorting"
import Link from "next/link"
import { ArrowBack } from "@mui/icons-material"
import { GiPerson } from "react-icons/gi"
import PlayerStatus from "./PlayerStatus"
import PlayerActions from "./PlayerActions"
import PlayerInfo from "./PlayerInfo"
import PlayerEffects from "./PlayerEffects"

interface PlayerEncounterViewProps {
  characterId: string
}

export default function PlayerEncounterView({
  characterId,
}: PlayerEncounterViewProps) {
  const { encounter } = useEncounter()

  // Find the character in the encounter
  // The characterId passed in the URL is the database ID (character.id), not the shot ID
  const character = useMemo(() => {
    if (!encounter?.shots) return null

    const allShots = getAllVisibleShots(encounter.shots)

    // Search through all shots to find the matching character
    const foundShot = allShots.find(s => s.character?.id === characterId)

    return foundShot?.character || null
  }, [encounter?.shots, characterId])

  useEffect(() => {
    if (character?.name && encounter?.name) {
      document.title = `${character.name} - ${encounter.name} - Chi War`
    } else if (character?.name) {
      document.title = `${character.name} - Chi War`
    }
  }, [character?.name, encounter?.name])

  if (!character) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Character not found in this fight.
        </Typography>
        <Link href={`/encounters/${encounter?.id}`} passHref>
          <Typography sx={{ mt: 2, textDecoration: "underline" }}>
            Return to Fight
          </Typography>
        </Link>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
        bgcolor: "background.default",
        p: { xs: 1, sm: 2 },
      }}
    >
      {/* Main Panel - BasePanel style */}
      <Paper
        sx={{
          position: "relative",
          border: "2px solid",
          borderColor: "primary.main",
          backgroundColor: "background.paper",
          overflow: "hidden",
        }}
      >
        {/* Panel Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Link href={`/encounters/${encounter?.id}`} passHref>
            <IconButton size="small" sx={{ color: "text.primary", mr: 0.5 }}>
              <ArrowBack />
            </IconButton>
          </Link>
          <GiPerson size={24} />
          <Typography variant="h6" component="h2" noWrap>
            {character.name}
          </Typography>
        </Box>

        {/* Main Content - Dark background container */}
        <Box
          sx={{
            backgroundColor: "action.hover",
            p: { xs: 0.5, sm: 1 },
          }}
        >
          <PlayerStatus character={character} />
          <PlayerEffects
            character={character}
            effects={encounter?.character_effects?.[character.id] || []}
          />
          <PlayerInfo character={character} />
          <PlayerActions character={character} />
        </Box>
      </Paper>
    </Box>
  )
}
