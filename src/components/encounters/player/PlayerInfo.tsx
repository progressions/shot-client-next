"use client"

import { Box, Typography, Chip } from "@mui/material"
import { ActionValues } from "@/components/encounters"
import type { Character, Weapon, Schtick } from "@/types"
import { useEncounter } from "@/contexts"
import { CS } from "@/services"

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
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, fontWeight: "bold", color: "text.secondary" }}
      >
        CHARACTER
      </Typography>

      {/* Character Type, Archetype, Faction */}
      <Box
        sx={{
          p: 1,
          backgroundColor: "background.paper",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          mb: 1,
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
        <Box sx={{ mt: 1 }}>
          <ActionValues character={character} />
        </Box>
      </Box>

      {/* Weapons */}
      {characterWeapons.length > 0 && (
        <Box
          sx={{
            p: 1,
            backgroundColor: "background.paper",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              color: "text.secondary",
              display: "block",
              mb: 0.5,
              fontSize: "0.65rem",
            }}
          >
            WEAPONS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {characterWeapons.map(weapon => (
              <Chip
                key={weapon.id}
                label={`${weapon.name} (${weapon.damage})`}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  "& .MuiChip-label": { px: 1, fontSize: "0.75rem" },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Schticks */}
      {characterSchticks.length > 0 && (
        <Box
          sx={{
            p: 1,
            backgroundColor: "background.paper",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              color: "text.secondary",
              display: "block",
              mb: 0.5,
              fontSize: "0.65rem",
            }}
          >
            SCHTICKS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {characterSchticks.map(schtick => (
              <Chip
                key={schtick.id}
                label={schtick.name}
                size="small"
                sx={{
                  height: 24,
                  bgcolor: "action.selected",
                  "& .MuiChip-label": { px: 1, fontSize: "0.75rem" },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}
