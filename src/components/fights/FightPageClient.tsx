"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Stack, Alert, Typography, Box } from "@mui/material"
import type { Fight } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { MembersList, VehiclesList, EditFightForm } from "@/components/fights"
import { useClient } from "@/contexts"
import { SpeedDialMenu } from "@/components/ui"

interface FightPageClientProps {
  fight: Fight
}

export default function FightPageClient({
  fight: initialFight,
}: FightPageClientProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [fight, setFight] = useState<Fight>(initialFight)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [editOpen, setEditOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [vehiclesOpen, setVehiclesOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    document.title = fight.name ? `${fight.name} - Chi War` : "Chi War"
  }, [fight.name])

  useEffect(() => {
    if (campaignData?.fight && campaignData.fight.id === initialFight.id) {
      setFight(campaignData.fight)
    }
  }, [campaignData, initialFight])

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!fight?.id) return
    if (!confirm(`Are you sure you want to delete the fight: ${fight.name}?`))
      return

    try {
      await client.deleteFight(fight)
      handleMenuClose()
      redirect("/fights")
    } catch (error_) {
      console.error("Failed to delete fight:", error_)
      setError("Failed to delete fight.")
    }
  }

  const handleOpenMembers = () => {
    setMembersOpen(prev => !prev)
  }

  const handleOpenVehicles = () => {
    setVehiclesOpen(prev => !prev)
  }

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
        }}
      >
        <Typography variant="h4">{fight.name}</Typography>
      </Box>
      {fight.image_url && (
        <Box
          component="img"
          src={fight.image_url}
          alt={fight.name}
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
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={fight.description}
          html={fight.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>
      <Stack direction="column" spacing={2}>
        <MembersList fight={fight} />
        <VehiclesList fight={fight} />
      </Stack>

      <EditFightForm
        key={JSON.stringify(fight)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        fight={fight}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
