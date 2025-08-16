"use client"
import { EntityLink } from "@/components/ui"

type VehicleLinkProperties = {
  vehicle: Vehicle
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function VehicleLink({
  vehicle,
  data,
  disablePopup = false,
  children,
  sx,
}: VehicleLinkProperties) {
  return (
    <EntityLink
      entity={vehicle}
      data={data}
      disablePopup={disablePopup}
      sx={sx}
    >
      {children}
    </EntityLink>
  )
}
