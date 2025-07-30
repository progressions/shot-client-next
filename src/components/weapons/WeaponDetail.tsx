"use client"

import { useEffect, useState } from "react"
import {
  Stack,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Box,
  Alert,
  Typography,
} from "@mui/material"
import type { Weapon } from "@/types"
import Link from "next/link"
import { WeaponName } from "@/components/weapons"
import { useCampaign, useClient } from "@/contexts"
import { RichTextRenderer } from "@/components/editor"
import DetailButtons from "@/components/DetailButtons"

interface WeaponDetailProperties {
  weapon: Weapon
  onDelete: (weaponId: string) => void
  onEdit: (weapon: Weapon) => void
}

export default function WeaponDetail({
  weapon: initialWeapon,
  onDelete,
  onEdit,
}: WeaponDetailProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [weapon, setWeapon] = useState<Weapon>(initialWeapon)

  useEffect(() => {
    if (campaignData?.weapon && campaignData.weapon.id === initialWeapon.id) {
      setWeapon(campaignData.weapon)
    }
  }, [campaignData, initialWeapon])

  const handleDelete = async () => {
    if (!weapon?.id) return
    if (!confirm(`Are you sure you want to delete the weapon: ${weapon.name}?`))
      return

    try {
      await client.deleteWeapon(weapon)
      onDelete(weapon.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete weapon"
      )
      console.error("Delete weapon error:", error_)
    }
  }

  const handleEdit = () => {
    onEdit(weapon)
  }

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      {weapon.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={weapon.image_url}
          alt={weapon.name}
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
            <Link href={`/weapons/${weapon.id}`} style={{ color: "#fff" }}>
              <WeaponName weapon={weapon} />
            </Link>{" "}
            ({weapon.damage}/{weapon.concealment || "-"}/
            {weapon.reload_value || "-"})
          </Typography>
          <DetailButtons
            name="Weapon"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {weapon.juncture && (
            <Typography variant="h6" sx={{ mb: 1 }}>
              <Chip size="small" label={`${weapon.juncture}`} />
            </Typography>
          )}
          {weapon.category && (
            <Typography variant="h6" sx={{ mb: 1 }}>
              <Chip size="small" label={`${weapon.category}`} />
            </Typography>
          )}
        </Stack>
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2">
            Damage: {weapon.damage || "Unknown"}
            {" / "}
            Concealment: {weapon.concealment || "-"}
            {" / "}
            Reload: {weapon.reload_value || "-"}
          </Typography>
        </Box>
        <RichTextRenderer key={weapon.description} html={weapon.description} />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
