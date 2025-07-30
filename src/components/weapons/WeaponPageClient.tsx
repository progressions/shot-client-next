"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Alert, Stack, Chip, Typography, Box } from "@mui/material"
import type { Weapon } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { EditWeaponForm } from "@/components/weapons"
import { useClient } from "@/contexts"
import { SpeedDialMenu } from "@/components/ui"

interface WeaponPageClientProps {
  weapon: Weapon
}

const junctureColors: Record<
  string,
  { main: string; rgb: string; contrastText: string }
> = {
  Past: {
    main: "#6D28D9",
    rgb: "rgb(109, 40, 217)",
    contrastText: "#FFFFFF",
  },
  Modern: {
    main: "#047857",
    rgb: "rgb(4, 120, 87)",
    contrastText: "#FFFFFF",
  },
  Ancient: {
    main: "#B45309",
    rgb: "rgb(180, 83, 9)",
    contrastText: "#FFFFFF",
  },
  Future: {
    main: "#1E40AF",
    rgb: "rgb(30, 64, 175)",
    contrastText: "#FFFFFF",
  },
}

export default function WeaponPageClient({
  weapon: initialWeapon,
}: WeaponPageClientProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()
  const [weapon, setWeapon] = useState<Weapon>(initialWeapon)
  const [editOpen, setEditOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [error, setError] = useState<string | null>(null)
  const open = Boolean(anchorEl)

  useEffect(() => {
    document.title = weapon.name ? `${weapon.name} - Chi War` : "Chi War"
  }, [weapon.name])

  useEffect(() => {
    if (campaignData?.weapon && campaignData.weapon.id === initialWeapon.id) {
      setWeapon(campaignData.weapon)
    }
  }, [campaignData, initialWeapon])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!weapon?.id) return
    if (!confirm(`Are you sure you want to delete the weapon: ${weapon.name}?`))
      return

    try {
      await client.deleteWeapon(weapon)
      handleMenuClose()
      redirect("/parties")
    } catch (error_) {
      console.error("Failed to delete weapon:", error_)
      setError("Failed to delete weapon.")
    }
  }

  const junctureColor = junctureColors[weapon.juncture] || junctureColors.Modern

  const actions = [
    { icon: <EditIcon />, name: "Edit", onClick: () => setEditOpen(true) },
    { icon: <DeleteIcon />, name: "Delete", onClick: handleDelete },
  ]

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onEdit={() => setEditOpen(true)} onDelete={handleDelete} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          position: "relative",
        }}
      >
        <Typography variant="h4" sx={{ mb: 1 }}>
          {weapon.name} ({weapon.damage}/{weapon.concealment || "-"}/
          {weapon.reload_value || "-"})
        </Typography>
      </Box>
      {weapon.image_url && (
        <Box
          component="img"
          src={weapon.image_url}
          alt={weapon.name}
          sx={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            objectPosition: "50% 20%",
            mb: 2,
            display: "block",
            mx: "auto",
          }}
        />
      )}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {weapon.juncture && (
          <Chip
            size="medium"
            sx={{ backgroundColor: junctureColor.main }}
            label={`${weapon.juncture}`}
          />
        )}
        {weapon.category && (
          <Chip
            size="medium"
            sx={{ backgroundColor: junctureColor.main }}
            label={`Path: ${weapon.category}`}
          />
        )}
        <Chip size="medium" label={`Damage ${weapon.damage}`} />
        <Chip size="medium" label={`Concealment ${weapon.concealment}`} />
        <Chip size="medium" label={`Reload ${weapon.reload_value}`} />
      </Stack>
      <RichTextRenderer
        key={weapon.description}
        html={weapon.description || ""}
        sx={{ mb: 2 }}
      />

      <EditWeaponForm
        key={JSON.stringify(weapon)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        weapon={weapon}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
