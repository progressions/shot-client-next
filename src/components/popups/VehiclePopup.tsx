import { Box, Typography, Stack } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import type { PopupProps, Vehicle } from "@/types"
import { defaultVehicle } from "@/types"
import { useState, useEffect } from "react"
import VehicleAvatar from "@/components/avatars/VehicleAvatar"
import VS from "@/services/VehicleService"
import GamemasterOnly from "@/components/GamemasterOnly"
import { useClient } from "@/contexts"

export default function CharacterPopup({ id }: PopupProps) {
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

  const subhead = [VS.type(vehicle), VS.factionName(vehicle)]
    .filter(Boolean)
    .join(" - ")

  if (!vehicle?.id) {
    return (
      <Box className={styles.mentionPopup}>
        <Typography variant="body2">Loading...</Typography>
      </Box>
    )
  }
  return (
    <Box className={styles.mentionPopup}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <VehicleAvatar vehicle={vehicle} />
        <Typography>{vehicle.name}</Typography>
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        {subhead}
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
