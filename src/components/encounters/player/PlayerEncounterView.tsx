"use client"

import { useMemo, useEffect } from "react"
import { Box, Typography, Paper, IconButton } from "@mui/material"
import { useEncounter } from "@/contexts"
import { findCharacterInAllShots } from "@/components/encounters/attacks/shotSorting"
import Link from "next/link"
import { ArrowBack } from "@mui/icons-material"
import { CharacterName } from "@/components/characters"
import { EntityAvatar } from "@/components/avatars"
import PlayerStatus from "./PlayerStatus"
import PlayerActions from "./PlayerActions"
import PlayerInfo from "./PlayerInfo"
import PlayerEffects from "./PlayerEffects"
import ShotCarousel from "./ShotCarousel"

interface PlayerEncounterViewProps {
  characterId: string
}

export default function PlayerEncounterView({
  characterId,
}: PlayerEncounterViewProps) {
  const { encounter, currentShot } = useEncounter()

  // Find the character in the encounter
  // The characterId passed in the URL is the database ID (character.id), not the shot ID
  // Use findCharacterInAllShots to include hidden characters - players should see their own character even if hidden
  const character = useMemo(() => {
    if (!encounter?.shots) return null
    return findCharacterInAllShots(encounter.shots, characterId)
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
        bgcolor: "#0a0a0a",
        p: { xs: 1, sm: 2 },
      }}
    >
      {/* Current Shot Banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          py: 1.5,
          px: 2,
          mb: 1.5,
          background:
            currentShot === 0
              ? "linear-gradient(135deg, #78350f 0%, #451a03 100%)"
              : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          borderRadius: 2,
          boxShadow:
            currentShot === 0
              ? "0 4px 20px rgba(120, 53, 15, 0.4)"
              : "0 4px 20px rgba(245, 158, 11, 0.3)",
          border: "1px solid",
          borderColor:
            currentShot === 0
              ? "rgba(251, 191, 36, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: currentShot === 0 ? "#fbbf24" : "#0a0a0a",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
            textShadow:
              currentShot === 0
                ? "0 2px 4px rgba(0,0,0,0.5)"
                : "0 1px 2px rgba(255,255,255,0.2)",
          }}
        >
          {currentShot === 0
            ? `Waiting for Sequence ${(encounter?.sequence ?? 0) + 1}`
            : `Current Shot: ${currentShot ?? "—"}`}
        </Typography>
      </Box>

      {/* Shot Carousel - shows all characters in shot order */}
      {encounter?.shots && (
        <ShotCarousel shots={encounter.shots} currentShot={currentShot} />
      )}

      {/* Main Panel */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          border: "1px solid",
          borderColor: "rgba(245, 158, 11, 0.3)",
          backgroundColor: "#111111",
          overflow: "hidden",
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Panel Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            background: "linear-gradient(180deg, #1a1a1a 0%, #111111 100%)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <Link href={`/encounters/${encounter?.id}`} passHref>
            <IconButton
              size="small"
              sx={{
                color: "#a1a1aa",
                mr: 0.5,
                "&:hover": {
                  color: "#f59e0b",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                },
              }}
            >
              <ArrowBack />
            </IconButton>
          </Link>
          <EntityAvatar entity={character} size={32} />
          <Typography
            variant="h6"
            component="h2"
            noWrap
            sx={{
              fontWeight: 600,
              color: "#fafafa",
              letterSpacing: 0.5,
            }}
          >
            <CharacterName character={character} />
          </Typography>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            backgroundColor: "#0d0d0d",
            p: { xs: 1, sm: 1.5 },
          }}
        >
          <PlayerStatus character={character} />
          <PlayerInfo character={character} />
          <PlayerEffects
            character={character}
            effects={encounter?.character_effects?.[character.id] || []}
          />
          <PlayerActions character={character} />
        </Box>
      </Paper>
    </Box>
  )
}
