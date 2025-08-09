"use client"
import { Stack, Typography } from "@mui/material"
import { VehicleDetail } from "@/components/vehicles"
import { useToast } from "@/contexts"

interface VehiclesMobileProps {
  formState: {
    data: {
      vehicles: Array<unknown> // Replace unknown with specific type if available
    }
  }
}

export default function VehiclesMobile({ formState }: VehiclesMobileProps) {
  const { toastSuccess } = useToast()
  const { vehicles } = formState.data

  const handleDelete = async () => {
    toastSuccess("Vehicle deleted successfully")
  }

  return (
    <Stack spacing={2}>
      {vehicles.length === 0 && (
        <Typography sx={{ color: "#fff" }}>No vehicles available</Typography>
      )}
      {vehicles.map(vehicle => (
        <VehicleDetail
          vehicle={vehicle}
          key={vehicle.id}
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  )
}
