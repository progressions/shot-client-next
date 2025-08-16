import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, Weapon } from "@/types"
import { defaultWeapon } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { WeaponLink } from "@/components/ui"
import { WeaponAvatar } from "@/components/avatars"
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

  console.log("WeaponPopup - weapon:", weapon)

  const subhead = [weapon.juncture, weapon.category].filter(Boolean).join(" - ")

  if (!weapon?.id) {
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
        <WeaponAvatar weapon={weapon} />
        <WeaponLink weapon={weapon} disablePopup={true} />
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        {subhead}
      </Typography>
      {weapon.description && (
        <Box mt={1}>
          <RichTextRenderer
            key={weapon.description}
            html={weapon.description}
          />
        </Box>
      )}
      <Stack direction="row" spacing={2} mt={2}>
        <Stack direction="row" spacing={0.5}>
          <strong>Damage</strong>
          <Box component="span">{weapon.damage}</Box>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <strong>Concealment</strong>
          <Box component="span">{weapon.concealment || "-"}</Box>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <strong>Reload</strong>
          <Box component="span">{weapon.reload_value || "-"}</Box>
        </Stack>
      </Stack>
    </Box>
  )
}
