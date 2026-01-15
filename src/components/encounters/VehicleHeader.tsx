import { Typography, Stack, Box, IconButton, Chip } from "@mui/material"
import { type Vehicle } from "@/types"
import { VehicleLink } from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"
import { VS } from "@/services"
import { FaMapMarkerAlt } from "react-icons/fa"

type VehicleHeaderProps = {
  vehicle: Vehicle
  location?: string
  onLocationClick?: () => void
}

export default function VehicleHeader({
  vehicle,
  location,
  onLocationClick,
}: VehicleHeaderProps) {
  const archetype = VS.archetype(vehicle)
  const faction = VS.faction(vehicle)?.name
  const isDefeated = VS.isDefeated(vehicle)
  const defeatType = VS.getDefeatType(vehicle)

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.5, sm: 1 }}
      component="span"
      sx={{ width: "100%" }}
    >
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <EntityAvatar entity={vehicle} showImpairments />
      </Box>
      <Stack
        direction="column"
        spacing={0.25}
        component="span"
        sx={{ flex: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          <VehicleLink vehicle={vehicle} />
          {isDefeated && defeatType && (
            <Chip
              label={defeatType === "crashed" ? "CRASHED" : "BOXED IN"}
              color={defeatType === "crashed" ? "error" : "warning"}
              size="small"
              sx={{
                height: "20px",
                fontSize: "0.65rem",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            />
          )}
          {onLocationClick && location && (
            <Chip
              size="small"
              icon={<FaMapMarkerAlt size={10} />}
              label={location}
              onClick={onLocationClick}
              sx={{
                height: "20px",
                fontSize: "0.7rem",
                ml: 1,
                "& .MuiChip-icon": {
                  fontSize: "0.7rem",
                  ml: 0.5,
                },
              }}
            />
          )}
          {onLocationClick && !location && (
            <IconButton
              size="small"
              onClick={onLocationClick}
              sx={{ p: 0.25 }}
              title="Set location"
            >
              <FaMapMarkerAlt size={12} />
            </IconButton>
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
            color: "text.secondary",
            letterSpacing: 0.5,
          }}
        >
          {archetype && faction ? (
            <>
              <Box component="span">{archetype}</Box>
              {" • "}
              <Box component="span">{faction}</Box>
            </>
          ) : (
            archetype || faction || "Vehicle"
          )}
        </Typography>
      </Stack>
    </Stack>
  )
}
