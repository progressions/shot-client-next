"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardMedia, Box, Alert, IconButton, Tooltip, Typography } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import type { Schtick } from "@/types/types"
import Link from "next/link"
import { SchtickName, SchtickDescription } from "@/components/schticks"
import { useCampaign, useClient } from "@/contexts"

interface SchtickDetailProps {
  schtick: Schtick
  onDelete: (schtickId: string) => void
  onEdit: (schtick: Schtick) => void
}

export default function SchtickDetail({ schtick: initialSchtick, onDelete, onEdit }: SchtickDetailProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [schtick, setSchtick] = useState<Schtick>(initialSchtick)

  useEffect(() => {
    if (campaignData?.schtick && campaignData.schtick.id === initialSchtick.id) {
      setSchtick({
        ...initialSchtick,
        name: campaignData.schtick.name || initialSchtick.name,
        description: campaignData.schtick.description || initialSchtick.description,
        image_url: campaignData.schtick.image_url || initialSchtick.image_url,
      })
    }
  }, [campaignData, initialSchtick])

  const handleDelete = async () => {
    if (!schtick?.id) return
    if (!confirm(`Are you sure you want to delete the schtick: ${schtick.name}?`)) return

    try {
      await client.deleteSchtick(schtick)
      onDelete(schtick.id)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete schtick")
      console.error("Delete schtick error:", err)
    }
  }

  const handleEdit = () => {
    onEdit(schtick)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = schtick.created_at
    ? new Date(schtick.created_at).toLocaleString("en-US", {
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
      {schtick.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={schtick.image_url}
          alt={schtick.name}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ p: "1rem" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <Link href={`/schticks/${schtick.id}`} style={{ color: "#fff" }}>
              <SchtickName schtick={schtick} />
            </Link>
          </Typography>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <Tooltip title="Edit Schtick">
              <IconButton
                color="inherit"
                onClick={handleEdit}
                size="small"
                aria-label="edit schtick"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Schtick">
              <IconButton
                color="inherit"
                onClick={handleDelete}
                size="small"
                aria-label="delete schtick"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <SchtickDescription schtick={schtick} />
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
