"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardMedia, Box, Alert, IconButton, Tooltip, Typography } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import type { Faction } from "@/types/types"
import Link from "next/link"
import { FactionName, FactionDescription } from "@/components/factions"
import { useCampaign, useClient } from "@/contexts"
import { CharacterName } from "@/components/characters"

interface FactionDetailProps {
  faction: Faction
  onDelete: (factionId: string) => void
  onEdit: (faction: Faction) => void
}

export default function FactionDetail({ faction: initialFaction, onDelete, onEdit }: FactionDetailProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [faction, setFaction] = useState<Faction>(initialFaction)

  useEffect(() => {
    if (campaignData?.faction && campaignData.faction.id === initialFaction.id) {
      setFaction({
        ...initialFaction,
        name: campaignData.faction.name || initialFaction.name,
        description: campaignData.faction.description || initialFaction.description,
        image_url: campaignData.faction.image_url || initialFaction.image_url,
      })
    }
  }, [campaignData, initialFaction])

  const handleDelete = async () => {
    if (!faction?.id) return
    if (!confirm(`Are you sure you want to delete the faction: ${faction.name}?`)) return

    try {
      await client.deleteFaction(faction)
      onDelete(faction.id)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete faction")
      console.error("Delete faction error:", err)
    }
  }

  const handleEdit = () => {
    onEdit(faction)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = faction.created_at
    ? new Date(faction.created_at).toLocaleString("en-US", {
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
      {faction.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={faction.image_url}
          alt={faction.name}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ p: "1rem" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <Link href={`/factions/${faction.id}`} style={{ color: "#fff" }}>
              <FactionName faction={faction} />
            </Link>
          </Typography>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <Tooltip title="Edit Faction">
              <IconButton
                color="inherit"
                onClick={handleEdit}
                size="small"
                aria-label="edit faction"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Faction">
              <IconButton
                color="inherit"
                onClick={handleDelete}
                size="small"
                aria-label="delete faction"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <FactionDescription faction={faction} />
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          {faction.characters && faction.characters.length > 0 ? (
            faction.characters.map((actor, index) => (
              <span key={`${actor.id}-${index}`}>
                <Link href={`/characters/${actor.id}`} style={{ color: "#ffffff", textDecoration: "underline" }}>
                  <CharacterName character={actor} />
                </Link>
                {index < faction.characters.length - 1 && ", "}
              </span>
            ))
          ) : null }
        </Typography>
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
