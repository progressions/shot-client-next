"use client"

import { Box, Typography, Chip, Stack } from "@mui/material"
import { CS } from "@/services"
import type { Character } from "@/types"
import { LocalPharmacy, Biotech } from "@mui/icons-material"
import { EntityAvatar } from "@/components/avatars"
import { Wounds } from "@/components/encounters"
import { Fragment } from "react"

interface PlayerStatusProps {
  character: Character
}

export default function PlayerStatus({ character }: PlayerStatusProps) {
  const deathMarks = CS.marksOfDeath(character)
  const upCheck = (character.status || []).includes("up_check_required")

  // Type guard for current_shot property merged from shot record
  const hasCurrentShot = (
    obj: unknown
  ): obj is { current_shot: number | undefined } =>
    typeof obj === "object" && obj !== null && "current_shot" in obj

  const currentShot = hasCurrentShot(character)
    ? (character.current_shot ?? 0)
    : 0

  return (
    <Fragment>
      {/* STATUS Section */}
      <Box sx={{ p: 1, mb: 0.5 }}>
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
      </Box>
    </Fragment>
  )
}
