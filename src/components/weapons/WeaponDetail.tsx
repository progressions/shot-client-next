"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardMedia, Box, Alert, IconButton, Tooltip, Typography } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import type { Weapon } from "@/types/types"
import Link from "next/link"
import { WeaponName, WeaponDescription } from "@/components/weapons"
import { useCampaign, useClient } from "@/contexts"

interface WeaponDetailProps {
  weapon: Weapon
  onDelete: (weaponId: string) => void
  onEdit: (weapon: Weapon) => void
}

export default function WeaponDetail({ weapon: initialWeapon, onDelete, onEdit }: WeaponDetailProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [weapon, setWeapon] = useState<Weapon>(initialWeapon)

  useEffect(() => {
    if (campaignData?.weapon && campaignData.weapon.id === initialWeapon.id) {
      setWeapon({
        ...initialWeapon,
        name: campaignData.weapon.name || initialWeapon.name,
        description: campaignData.weapon.description || initialWeapon.description,
        image_url: campaignData.weapon.image_url || initialWeapon.image_url,
      })
    }
  }, [campaignData, initialWeapon])

  const handleDelete = async () => {
    if (!weapon?.id) return
    if (!confirm(`Are you sure you want to delete the weapon: ${weapon.name}?`)) return

    try {
      await client.deleteWeapon(weapon)
      onDelete(weapon.id)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete weapon")
      console.error("Delete weapon error:", err)
    }
  }

  const handleEdit = () => {
    onEdit(weapon)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = weapon.created_at
    ? new Date(weapon.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      })
    : "Unknown"

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <Link href={`/weapons/${weapon.id}`} style={{ color: "#fff" }}>
              <WeaponName weapon={weapon} />
            </Link>
          </Typography>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <Tooltip title="Edit Weapon">
              <IconButton
                color="inherit"
                onClick={handleEdit}
                size="small"
                aria-label="edit weapon"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Weapon">
              <IconButton
                color="inherit"
                onClick={handleDelete}
                size="small"
                aria-label="delete weapon"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <WeaponDescription weapon={weapon} />
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
