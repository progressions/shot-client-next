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

            {/* Fortune Action Button */}
            {canUseFortune && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setActiveAction("fortune")}
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.5,
                  fontSize: "0.65rem",
                  flexDirection: "column",
                  gap: 0.25,
                  borderColor: "warning.main",
                  color: "warning.main",
                  "&:hover": {
                    borderColor: "warning.dark",
                    backgroundColor: "warning.dark",
                    color: "warning.contrastText",
                  },
                }}
              >
                <AutoAwesome sx={{ fontSize: 16 }} />
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.55rem", lineHeight: 1 }}
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
              p: 1,
              backgroundColor: "background.paper",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <EntityAvatar entity={drivingVehicle} size={48} />
              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <DirectionsCar
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="subtitle2" fontWeight="bold">
                    {drivingVehicle.name}
                  </Typography>
                  {isVehicleDefeated && vehicleDefeatType && (
                    <Chip
                      label={
                        vehicleDefeatType === "crashed" ? "CRASHED" : "BOXED IN"
                      }
                      color={
                        vehicleDefeatType === "crashed" ? "error" : "warning"
                      }
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.6rem",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                </Stack>

                {/* Vehicle Stats Row 1 */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.25 }}
                >
                  <strong>Accel</strong> {VS.acceleration(drivingVehicle)} •{" "}
                  <strong>Hand</strong> {VS.handling(drivingVehicle)} •{" "}
                  <strong>Squeal</strong> {VS.squeal(drivingVehicle)}
                </Typography>

                {/* Vehicle Stats Row 2 */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  <strong>Frame</strong> {VS.frame(drivingVehicle)} •{" "}
                  <strong>Crunch</strong> {VS.crunch(drivingVehicle)}
                </Typography>
              </Box>

              {/* Chase and Condition Points */}
              <ChaseConditionPoints
                vehicle={drivingVehicle}
                driver={character}
              />
            </Stack>
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
