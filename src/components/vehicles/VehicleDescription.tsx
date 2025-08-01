"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Vehicle } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"
import { VS } from "@/services"

interface VehicleDescriptionProperties {
  vehicle: Vehicle
  sx?: SystemStyleObject<Theme>
}

export default function VehicleDescription({
  vehicle,
  sx = {},
}: VehicleDescriptionProperties) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(
    VS.description(vehicle) || ""
  )

  useEffect(() => {
    if (campaignData) {
      const updatedVehicle = campaignData?.vehicle
      if (
        updatedVehicle &&
        updatedVehicle.id === vehicle.id &&
        VS.description(updatedVehicle)
      ) {
        setDisplayDescription(VS.description(updatedVehicle))
      }
    }
  }, [campaignData, vehicle.id])

  if (!VS.description(vehicle)) return
  return <RichTextRenderer html={displayDescription || ""} sx={sx} />
}
