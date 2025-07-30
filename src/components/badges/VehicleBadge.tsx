"use client"

import type { Vehicle } from "@/types"
import { VehicleLink } from "@/components/links"
import { Badge } from "@/components/badges"
import { SystemStyleObject, Theme } from "@mui/system"

type VehicleBadgeProps = {
  vehicle: Vehicle
  size?: "sm" | "md" | "lg"
  sx?: SystemStyleObject<Theme>
}

export default function VehicleBadge({
  vehicle,
  size = "md",
  sx = {},
}: VehicleBadgeProps) {
  return (
    <Badge
      entity={vehicle}
      size={size}
      sx={sx}
      title={<VehicleLink vehicle={vehicle} />}
    >
      {" "}
    </Badge>
  )
}
