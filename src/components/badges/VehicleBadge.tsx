"use client"

import type { Vehicle } from "@/types"
import VehicleLink from "../ui/links/VehicleLink"
import Badge from "./Badge"
import { SystemStyleObject, Theme } from "@mui/system"

type VehicleBadgeProperties = {
  vehicle: Vehicle
  size?: "sm" | "md" | "lg"
  sx?: SystemStyleObject<Theme>
}

export default function VehicleBadge({
  vehicle,
  size = "md",
  sx = {},
}: VehicleBadgeProperties) {
  return (
    <Badge
      name="vehicle"
      entity={vehicle}
      size={size}
      sx={sx}
      title={<VehicleLink vehicle={vehicle} />}
    >
      {" "}
    </Badge>
  )
}
