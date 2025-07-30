import { Box, Typography, Stack } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import type { PopupProps, Weapon } from "@/types"
import { defaultWeapon } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import WeaponAvatar from "@/components/avatars/WeaponAvatar"
import { useClient } from "@/contexts"

export default function WeaponPopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [weapon, setWeapon] = useState<Weapon>(defaultWeapon)

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        const response = await client.getWeapon({ id })
        const fetchedWeapon = response.data
        console.log("Fetched weapon:", fetchedWeapon)
        if (fetchedWeapon) {
          setWeapon(fetchedWeapon)
        } else {
          console.error(`Weapon with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching weapon:", error)
      }
    }

    if (user?.id && id) {
      fetchWeapon().catch(error => {
        console.error("Failed to fetch weapon:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null // Use null instead of <></> for consistency
  }

  const subhead = [weapon.juncture, weapon.category].filter(Boolean).join(" - ")

  if (!weapon?.id) {
    return (
      <Box className={styles.mentionPopup}>
        <Typography variant="body2">Loading...</Typography>
      </Box>
    )
  }
  return (
    <Box className={styles.mentionPopup}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <WeaponAvatar weapon={weapon} />
        <Typography>{weapon.name}</Typography>
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        {subhead}
      </Typography>
      <Box mt={1}>
        <RichTextRenderer key={weapon.description} html={weapon.description} />
      </Box>
    </Box>
  )
}
