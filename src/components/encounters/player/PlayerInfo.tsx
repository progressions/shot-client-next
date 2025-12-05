"use client"

import { Box, Typography, Chip } from "@mui/material"
import { ActionValues } from "@/components/encounters"
import type { Character, Weapon, Schtick } from "@/types"
import { useEncounter } from "@/contexts"
import { CS } from "@/services"
import { WeaponLink } from "@/components/ui/links"
import { SchtickLink } from "@/components/ui/links"

interface PlayerInfoProps {
  character: Character
}

export default function PlayerInfo({ character }: PlayerInfoProps) {
  const { weapons, schticks } = useEncounter()

  // Character details
  const type = CS.type(character)
  const archetype = CS.archetype(character)
  const faction = CS.faction(character)?.name

  // Helper to get weapon details
  const getWeaponDetails = (weaponId: string): Weapon | undefined => {
    return weapons[weaponId]
  }

  // Helper to get schtick details
  const getSchtickDetails = (schtickId: string): Schtick | undefined => {
    return schticks[schtickId]
  }

  const characterWeapons = (character.weapon_ids || [])
    .map(getWeaponDetails)
    .filter((w): w is Weapon => w !== undefined)

  const characterSchticks = (character.schtick_ids || [])
    .map(getSchtickDetails)
    .filter((s): s is Schtick => s !== undefined)

  return (
    <Box sx={{ p: 1, mb: 0.5 }}>
      {/* Character Type, Archetype, Faction */}
      <Box
        sx={{
          p: 1.5,
          background: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.06)",
          mb: 1,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            fontSize: "0.7rem",
            color: "text.secondary",
            letterSpacing: 0.5,
          }}
        >
          {type && (
            <>
              <Box component="span">{type}</Box>
              {(archetype || faction) && " • "}
            </>
          )}
          {archetype && faction ? (
            <>
              <Box component="span">{faction}</Box>
              {" • "}
              <Box component="span">{archetype}</Box>
            </>
          ) : archetype ? (
            <Box component="span">{archetype}</Box>
          ) : faction ? (
            <Box component="span">{faction}</Box>
          ) : (
            !type && "Character"
          )}
        </Typography>

        {/* Action Values Section */}
        <Box sx={{ mt: 1.5 }}>
          <ActionValues character={character} />
        </Box>
      </Box>

      {/* Weapons */}
      {characterWeapons.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            background: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.06)",
            mb: 1,
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: "#71717a",
              display: "block",
              mb: 0.75,
              fontSize: "0.65rem",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            WEAPONS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {characterWeapons.map(weapon => (
              <Chip
                key={weapon.id}
                label={
                  <WeaponLink weapon={weapon}>
                    {weapon.name} ({weapon.damage})
                  </WeaponLink>
                }
                size="small"
                clickable
                sx={theme => ({
                  height: 26,
                  backgroundColor: theme.palette.custom?.amber?.bg,
                  border: `1px solid ${theme.palette.custom?.amber?.glow}`,
                  color: theme.palette.text.primary,
                  "& .MuiChip-label": {
                    px: 1.25,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  },
                  "& a": {
                    color: "inherit",
                    textDecoration: "none",
                  },
                })}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Schticks */}
      {characterSchticks.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            background: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.06)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: "#71717a",
              display: "block",
              mb: 0.75,
              fontSize: "0.65rem",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            SCHTICKS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {characterSchticks.map(schtick => (
              <Chip
                key={schtick.id}
                label={
                  <SchtickLink schtick={schtick}>{schtick.name}</SchtickLink>
                }
                size="small"
                clickable
                sx={theme => ({
                  height: 26,
                  backgroundColor: "rgba(161, 161, 170, 0.1)",
                  border: "1px solid rgba(161, 161, 170, 0.2)",
                  color: theme.palette.custom?.neutral?.text,
                  "& .MuiChip-label": {
                    px: 1.25,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  },
                  "& a": {
                    color: "inherit",
                    textDecoration: "none",
                  },
                })}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}
