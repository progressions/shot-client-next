import { Typography, Stack, IconButton, Tooltip } from "@mui/material"
import { MdLocationPin } from "react-icons/md"
import { type Vehicle } from "@/types"
import { VehicleLink } from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"
import { VS } from "@/services"

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
  const divider = VS.archetype(vehicle) && VS.faction(vehicle) ? " - " : ""
  return (
    <Stack direction="row" spacing={1} component="span">
      <EntityAvatar entity={vehicle} />
      <Stack direction="column" spacing={0} component="span">
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          component="span"
        >
          <VehicleLink vehicle={vehicle} />
          {location && (
            <>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.875rem" }}
                component="span"
              >
                ({location})
              </Typography>
              {onLocationClick && (
                <Tooltip title="Edit location">
                  <IconButton
                    size="small"
                    onClick={onLocationClick}
                    sx={{
                      p: 0.25,
                      ml: 0.5,
                      color: "text.secondary",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    <MdLocationPin size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Stack>
        <Typography
          variant="caption"
          sx={{ textTransform: "lowercase", fontVariant: "small-caps" }}
        >
          {VS.archetype(vehicle)}
          {divider}
          {VS.faction(vehicle)?.name}
        </Typography>
      </Stack>
    </Stack>
  )
}
