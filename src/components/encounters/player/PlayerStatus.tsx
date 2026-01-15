"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { CS, VS } from "@/services"
import type { Character, Vehicle } from "@/types"
import {
  LocalPharmacy,
  Biotech,
  DirectionsCar,
  AutoAwesome,
  Close,
} from "@mui/icons-material"
import { EntityAvatar } from "@/components/avatars"
import {
  Wounds,
  ChaseConditionPoints,
  FortunePanel,
} from "@/components/encounters"

interface PlayerStatusProps {
  character: Character
}

type StatusActionType = "fortune" | null

export default function PlayerStatus({ character }: PlayerStatusProps) {
  const [activeAction, setActiveAction] = useState<StatusActionType>(null)
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"))

  const deathMarks = CS.marksOfDeath(character)
  const upCheck = (character.status || []).includes("up_check_required")

  // Check if character is driving a vehicle
  const drivingVehicle = (character as Character & { driving?: Vehicle })
    .driving

  // Check if character can use fortune
  const canUseFortune = CS.isPC(character) && CS.fortune(character) > 0

  // Check vehicle defeat status for display
  const isVehicleDefeated = drivingVehicle && VS.isDefeated(drivingVehicle)
  const vehicleDefeatType = drivingVehicle
    ? VS.getDefeatType(drivingVehicle)
    : null

  const handleClose = () => setActiveAction(null)

  // Type guard for current_shot property merged from shot record
  const hasCurrentShot = (
    obj: unknown
  ): obj is { current_shot: number | undefined } =>
    typeof obj === "object" && obj !== null && "current_shot" in obj

  const currentShot = hasCurrentShot(character)
    ? (character.current_shot ?? 0)
    : 0

  const renderActivePanel = () => {
    switch (activeAction) {
      case "fortune":
        return <FortunePanel character={character} onComplete={handleClose} />
      default:
        return null
    }
  }

  return (
    <>
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
              p: 1.5,
              background: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
              borderRadius: 2,
              border: "1px solid rgba(245, 158, 11, 0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 80,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#71717a",
                fontSize: "0.65rem",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              SHOT
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                lineHeight: 1,
                background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 30px rgba(245, 158, 11, 0.3)",
              }}
            >
              {currentShot}
            </Typography>
          </Box>

          {/* Avatar and Wounds */}
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              background: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Wounds character={character} variant="full" />

              {/* Critical Status Indicators */}
              {(deathMarks > 0 || upCheck) && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ mt: 0.75 }}
                  flexWrap="wrap"
                >
                  {deathMarks > 0 && (
                    <Chip
                      icon={<Biotech sx={{ fontSize: 14 }} />}
                      label={`Death: ${deathMarks}`}
                      size="small"
                      sx={{
                        height: 22,
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        borderColor: "#ef4444",
                        color: "#ef4444",
                        border: "1px solid",
                        "& .MuiChip-icon": { color: "#ef4444" },
                        "& .MuiChip-label": {
                          px: 0.75,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        },
                      }}
                    />
                  )}
                  {upCheck && (
                    <Chip
                      icon={<LocalPharmacy sx={{ fontSize: 14 }} />}
                      label="Up Check"
                      size="small"
                      sx={{
                        height: 22,
                        backgroundColor: "rgba(245, 158, 11, 0.15)",
                        borderColor: "#f59e0b",
                        color: "#f59e0b",
                        border: "1px solid",
                        "& .MuiChip-icon": { color: "#f59e0b" },
                        "& .MuiChip-label": {
                          px: 0.75,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        },
                      }}
                    />
                  )}
                </Stack>
              )}
            </Box>

            {/* Fortune Action Button */}
            {canUseFortune && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setActiveAction("fortune")}
                sx={{
                  minWidth: 0,
                  px: 1.5,
                  py: 1,
                  fontSize: "0.65rem",
                  flexDirection: "column",
                  gap: 0.5,
                  borderColor: "#fbbf24",
                  color: "#fbbf24",
                  background: "rgba(251, 191, 36, 0.08)",
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#fbbf24",
                    backgroundColor: "rgba(251, 191, 36, 0.2)",
                    color: "#fbbf24",
                  },
                }}
              >
                <AutoAwesome sx={{ fontSize: 18 }} />
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.6rem", lineHeight: 1, fontWeight: 600 }}
                >
                  Fortune ({CS.fortune(character)})
                </Typography>
              </Button>
            )}
          </Box>
        </Box>

        {/* Vehicle Stats - shown when character is driving */}
        {drivingVehicle && (
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              background: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.06)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  borderRadius: 1.5,
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  p: 0.25,
                }}
              >
                <EntityAvatar
                  entity={drivingVehicle}
                  size={48}
                  showImpairments
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <DirectionsCar sx={{ fontSize: 16, color: "#f59e0b" }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ color: "#fafafa" }}
                  >
                    {drivingVehicle.name}
                  </Typography>
                  {isVehicleDefeated && vehicleDefeatType && (
                    <Chip
                      label={
                        vehicleDefeatType === "crashed" ? "CRASHED" : "BOXED IN"
                      }
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        backgroundColor:
                          vehicleDefeatType === "crashed"
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(245, 158, 11, 0.2)",
                        color:
                          vehicleDefeatType === "crashed"
                            ? "#ef4444"
                            : "#f59e0b",
                        border: "1px solid",
                        borderColor:
                          vehicleDefeatType === "crashed"
                            ? "#ef4444"
                            : "#f59e0b",
                      }}
                    />
                  )}
                </Stack>

                {/* Vehicle Stats Row 1 */}
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 0.5, color: "#a1a1aa" }}
                >
                  <Box
                    component="span"
                    sx={{ color: "#f59e0b", fontWeight: 600 }}
                  >
                    Accel
                  </Box>{" "}
                  {VS.acceleration(drivingVehicle)} •{" "}
                  <Box
                    component="span"
                    sx={{ color: "#f59e0b", fontWeight: 600 }}
                  >
                    Hand
                  </Box>{" "}
                  {VS.handling(drivingVehicle)} •{" "}
                  <Box
                    component="span"
                    sx={{ color: "#f59e0b", fontWeight: 600 }}
                  >
                    Squeal
                  </Box>{" "}
                  {VS.squeal(drivingVehicle)}
                </Typography>

                {/* Vehicle Stats Row 2 */}
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "#a1a1aa" }}
                >
                  <Box
                    component="span"
                    sx={{ color: "#f59e0b", fontWeight: 600 }}
                  >
                    Frame
                  </Box>{" "}
                  {VS.frame(drivingVehicle)} •{" "}
                  <Box
                    component="span"
                    sx={{ color: "#f59e0b", fontWeight: 600 }}
                  >
                    Crunch
                  </Box>{" "}
                  {VS.crunch(drivingVehicle)}
                </Typography>
              </Box>
            </Stack>

            {/* Chase and Condition Points */}
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
              <ChaseConditionPoints
                vehicle={drivingVehicle}
                driver={character}
                variant="full"
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Action Dialog */}
      <Dialog
        open={!!activeAction}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
      >
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
    </>
  )
}
