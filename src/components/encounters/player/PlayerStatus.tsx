"use client"

import { Box, Typography, Chip, Stack } from "@mui/material"
import { CS } from "@/services"
import type { Character, CharacterEffect } from "@/types"
import { LocalPharmacy, Biotech } from "@mui/icons-material"
import { EntityAvatar } from "@/components/avatars"
import { Wounds } from "@/components/encounters"
import { Fragment } from "react"

interface PlayerStatusProps {
  character: Character
  activeEffects?: CharacterEffect[]
}

export default function PlayerStatus({
  character,
  activeEffects = [],
}: PlayerStatusProps) {
  const deathMarks = CS.marksOfDeath(character)
  const upCheck = (character.status || []).includes("up_check_required")

  // Safe cast for current_shot which might be merged in from the shot record
  const currentShot =
    (character as unknown as { current_shot?: number }).current_shot || 0

  return (
    <Fragment>
      {/* STATUS Section */}
      <Box sx={{ p: 1, mb: 0.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: "bold", color: "text.secondary" }}
        >
          STATUS
        </Typography>

        {/* Current Shot and Avatar/Wounds in a row */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "stretch",
          }}
        >
          {/* Current Shot */}
          <Box
            sx={{
              p: 1,
              backgroundColor: "background.paper",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 70,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: "text.secondary",
                fontSize: "0.65rem",
              }}
            >
              SHOT
            </Typography>
            <Typography
              variant="h4"
              color="primary"
              sx={{ fontWeight: "bold", lineHeight: 1 }}
            >
              {currentShot}
            </Typography>
          </Box>

          {/* Avatar and Wounds */}
          <Box
            sx={{
              flex: 1,
              p: 1,
              backgroundColor: "background.paper",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <EntityAvatar entity={character} size={60} />
            <Box sx={{ flex: 1 }}>
              <Wounds character={character} />

              {/* Critical Status Indicators */}
              {(deathMarks > 0 || upCheck) && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ mt: 0.5 }}
                  flexWrap="wrap"
                >
                  {deathMarks > 0 && (
                    <Chip
                      icon={<Biotech sx={{ fontSize: 14 }} />}
                      label={`Death: ${deathMarks}`}
                      color="error"
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 20,
                        "& .MuiChip-label": { px: 0.5, fontSize: "0.65rem" },
                      }}
                    />
                  )}
                  {upCheck && (
                    <Chip
                      icon={<LocalPharmacy sx={{ fontSize: 14 }} />}
                      label="Up Check"
                      color="warning"
                      size="small"
                      sx={{
                        height: 20,
                        "& .MuiChip-label": { px: 0.5, fontSize: "0.65rem" },
                      }}
                    />
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        {/* Active Effects */}
        {activeEffects.length > 0 && (
          <Box
            sx={{
              mt: 1,
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
              ACTIVE EFFECTS
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {activeEffects.map(effect => (
                <Chip
                  key={effect.id}
                  label={`${effect.name} (${effect.severity})`}
                  size="small"
                  color="info"
                  sx={{
                    height: 20,
                    bgcolor: "info.light",
                    color: "info.contrastText",
                    "& .MuiChip-label": { px: 0.5, fontSize: "0.65rem" },
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Fragment>
  )
}
