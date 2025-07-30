"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Chip, Stack, Alert, Typography, Box } from "@mui/material"
import type { Schtick } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { EditSchtickForm } from "@/components/schticks"
import { useClient } from "@/contexts"
import { SpeedDialMenu } from "@/components/ui"

interface SchtickPageClientProps {
  schtick: Schtick
}

export default function SchtickPageClient({
  schtick: initialSchtick,
}: SchtickPageClientProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [schtick, setSchtick] = useState<Schtick>(initialSchtick)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    document.title = schtick.name ? `${schtick.name} - Chi War` : "Chi War"
  }, [schtick.name])

  useEffect(() => {
    if (
      campaignData?.schtick &&
      campaignData.schtick.id === initialSchtick.id
    ) {
      setSchtick(campaignData.schtick)
    }
  }, [campaignData, initialSchtick])

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!schtick?.id) return
    if (
      !confirm(`Are you sure you want to delete the schtick: ${schtick.name}?`)
    )
      return

    try {
      await client.deleteSchtick(schtick)
      handleMenuClose()
      redirect("/schticks")
    } catch (error_) {
      console.error("Failed to delete schtick:", error_)
      setError("Failed to delete schtick.")
    }
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
        <Typography variant="h4">{schtick.name}</Typography>
      </Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          <Chip
            size="medium"
            label={`Category: ${schtick.category}`}
            sx={{ backgroundColor: schtick.color }}
          />
        </Typography>
        {schtick.path && (
          <Typography variant="h6" sx={{ mb: 1 }}>
            <Chip size="medium" label={`Path: ${schtick.path}`} />
          </Typography>
        )}
      </Stack>
      {schtick.image_url && (
        <Box
          component="img"
          src={schtick.image_url}
          alt={schtick.name}
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
          key={schtick.description}
          html={schtick.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>

      <EditSchtickForm
        key={JSON.stringify(schtick)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        schtick={schtick}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
