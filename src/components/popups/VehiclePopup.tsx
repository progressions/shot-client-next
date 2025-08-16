import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, Faction, Vehicle } from "@/types"
import { defaultVehicle } from "@/types"
import { useState, useEffect } from "react"
import { VehicleAvatar } from "@/components/avatars"
import VS from "@/services/VehicleService"
import GamemasterOnly from "@/components/GamemasterOnly"
import { RichTextRenderer } from "@/components/editor"
import { useClient } from "@/contexts"
import {
  VehicleLink,
  ArchetypeLink,
  TypeLink,
  FactionLink,
} from "@/components/ui"

export default function VehiclePopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [vehicle, setVehicle] = useState<Vehicle>(defaultVehicle)

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await client.getVehicle({ id })
        const fetchedVehicle = response.data
        console.log("Fetched vehicle:", fetchedVehicle)
        if (fetchedVehicle) {
          setVehicle(fetchedVehicle)
        } else {
          console.error(`Vehicle with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error)
      }
    }

    if (user?.id && id) {
      fetchVehicle().catch(error => {
        console.error("Failed to fetch vehicle:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null
  }

  if (!vehicle?.id) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2">Loading...</Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    )
  }

  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <VehicleAvatar vehicle={vehicle} disablePopup={true} />
        <Typography variant="h6">
          <VehicleLink vehicle={vehicle} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography
        component="div"
        variant="caption"
        sx={{ textTransform: "uppercase" }}
      >
        {VS.type(vehicle) && <TypeLink vehicleType={VS.type(vehicle)} />}
        {VS.archetype(vehicle) && (
          <>
            {" - "}
            <ArchetypeLink archetype={VS.archetype(vehicle)} />
          </>
        )}
        {VS.faction(vehicle) && (
          <>
            {" - "}
            <FactionLink faction={VS.faction(vehicle) as Faction} />
          </>
        )}
      </Typography>
      <GamemasterOnly user={user}>
        <Box mt={1}>
          <Typography variant="body2">
            {VS.acceleration(vehicle) > 0 && (
              <>
                <strong>Acceleration</strong> {VS.acceleration(vehicle)}{" "}
              </>
            )}
            {VS.handling(vehicle) > 0 && (
              <>
                <strong>Handling</strong> {VS.handling(vehicle)}{" "}
              </>
            )}
            {VS.squeal(vehicle) > 0 && (
              <>
                <strong>Squeal</strong> {VS.squeal(vehicle)}{" "}
              </>
            )}
          </Typography>
          <Typography variant="body2">
            {VS.frame(vehicle) > 0 && (
              <>
                <strong>Frame</strong> {VS.frame(vehicle)}{" "}
              </>
            )}
            {VS.crunch(vehicle) > 0 && (
              <>
                <strong>Crunch</strong> {VS.crunch(vehicle)}{" "}
              </>
            )}
          </Typography>
        </Box>
      </GamemasterOnly>
    </Box>
  )
}
