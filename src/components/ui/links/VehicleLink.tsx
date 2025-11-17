"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts"
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
  vehicle: initialVehicle,
  data,
  disablePopup = false,
  children,
  sx,
}: VehicleLinkProperties) {
  const { subscribeToEntity } = useApp()
  const [vehicle, setVehicle] = useState(initialVehicle)

  // Subscribe to vehicle updates via WebSocket
  useEffect(() => {
    const unsubscribe = subscribeToEntity("vehicle", updatedVehicle => {
      if (updatedVehicle && updatedVehicle.id === initialVehicle.id) {
        setVehicle(updatedVehicle)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialVehicle.id])

  // Update when prop changes
  useEffect(() => {
    setVehicle(initialVehicle)
  }, [initialVehicle])

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
