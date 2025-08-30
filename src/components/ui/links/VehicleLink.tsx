"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const VehiclePopup = dynamic(() => import("@/components/popups/VehiclePopup"), {
  ssr: false,
})

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
      popupOverride={VehiclePopup}
      sx={sx}
    >
      {children || vehicle.name}
    </EntityLink>
  )
}
