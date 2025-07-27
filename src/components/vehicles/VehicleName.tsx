"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Vehicle } from "@/types/types"

interface VehicleNameProps {
  vehicle: Vehicle
}

export default function VehicleName({ vehicle }: VehicleNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(vehicle.name)

  useEffect(() => {
    if (campaignData && "vehicle" in campaignData) {
      const updatedVehicle = campaignData.vehicle
      if (updatedVehicle && updatedVehicle.id === vehicle.id) {
        if (updatedVehicle.name) {
          setDisplayName(updatedVehicle.name)
        }
      }
    }
  }, [campaignData, vehicle.id])

  return (<>
    {displayName}
  </>)
}
