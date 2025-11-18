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
    // Subscribe to individual vehicle updates
    const unsubscribeVehicle = subscribeToEntity("vehicle", updatedVehicle => {
      if (updatedVehicle && updatedVehicle.id === initialVehicle.id) {
        console.log("🔄 [VehicleLink] Received vehicle update:", updatedVehicle)
        setVehicle(updatedVehicle)
      }
    })

    // Subscribe to vehicles reload signal
    const unsubscribeVehicles = subscribeToEntity("vehicles", reloadSignal => {
      if (reloadSignal === "reload") {
        console.log(
          "🔄 [VehicleLink] Received vehicles reload signal, keeping current data for now"
        )
      }
    })

    return () => {
      unsubscribeVehicle()
      unsubscribeVehicles()
    }
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
