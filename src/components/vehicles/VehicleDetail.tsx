"use client"

import { useEffect, useState } from "react"
import {
  CardMedia,
  Card,
  CardContent,
  Box,
  Alert,
  Typography,
} from "@mui/material"
import type { Vehicle } from "@/types"
import { useCampaign, useClient } from "@/contexts"
import { FactionLink, VehicleLink } from "@/components/links"
import DetailButtons from "@/components/DetailButtons"
import { CS } from "@/services"
import { VehicleDescription } from "@/components/vehicles"

interface VehicleDetailProperties {
  vehicle: Vehicle
  onDelete: (vehicleId: string) => void
  onEdit: (vehicle: Vehicle) => void
}

export default function VehicleDetail({
  vehicle: initialVehicle,
  onDelete,
  onEdit,
}: VehicleDetailProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle>(initialVehicle)

  useEffect(() => {
    if (
      campaignData?.vehicle &&
      campaignData.vehicle.id === initialVehicle.id
    ) {
      console.log("Updating vehicle from campaign data:", campaignData.vehicle)
      setVehicle(campaignData.vehicle)
    }
  }, [campaignData, initialVehicle])

  const handleDelete = async () => {
    if (!vehicle?.id) return
    if (
      !confirm(`Are you sure you want to delete the vehicle: ${vehicle.name}?`)
    )
      return

    try {
      await client.deleteVehicle(vehicle)
      onDelete(vehicle.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete vehicle"
      )
      console.error("Delete vehicle error:", error_)
    }
  }

  const handleEdit = () => {
    onEdit(vehicle)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = vehicle.created_at
    ? new Date(vehicle.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    : "Unknown"

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      {vehicle.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={vehicle.image_url}
          alt={vehicle.name}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ p: "1rem" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <VehicleLink vehicle={vehicle} disablePopup={true} />
          </Typography>
          <DetailButtons
            name="Vehicle"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
        <Typography
          component="div"
          variant="caption"
          sx={{ textTransform: "uppercase" }}
        >
          {CS.faction(vehicle) && (
            <>
              {" - "}
              <FactionLink faction={CS.faction(vehicle) as Faction} />
            </>
          )}
        </Typography>
        <VehicleDescription vehicle={vehicle} />
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          Created: {formattedCreatedAt}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
