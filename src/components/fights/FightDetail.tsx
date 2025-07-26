"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, Box, Alert, IconButton, Tooltip, Typography } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import type { Fight } from "@/types/types"
import Link from "next/link"
import { FightName, FightDescription } from "@/components/fights"
import { useCampaign, useClient } from "@/contexts"
import { CharacterName } from "@/components/characters"

interface FightDetailProps {
  fight: Fight
  onDelete: (fightId: string) => void
  onEdit: (fight: Fight) => void
}

export default function FightDetail({ fight: initialFight, onDelete, onEdit }: FightDetailProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [fight, setFight] = useState<Fight>(initialFight)

  useEffect(() => {
    if (campaignData?.fight) {
      setFight({
        ...initialFight,
        name: campaignData.fight.name || initialFight.name,
        description: campaignData.fight.description || initialFight.description
      })
    }
  }, [campaignData, initialFight])

  const handleDelete = async () => {
    if (!fight?.id) return
    if (!confirm(`Are you sure you want to delete the fight: ${fight.name}?`)) return

    try {
      await client.deleteFight(fight)
      onDelete(fight.id)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete fight")
      console.error("Delete fight error:", err)
    }
  }

  const handleEdit = () => {
    onEdit(fight)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = fight.created_at
    ? new Date(fight.created_at).toLocaleString("en-US", {
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
      <CardContent sx={{ p: "1rem" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <Link href={`/fights/${fight.id}`} style={{ color: "#fff" }}>
              <FightName fight={fight} />
            </Link>
          </Typography>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <Tooltip title="Edit Fight">
              <IconButton
                color="inherit"
                onClick={handleEdit}
                size="small"
                aria-label="edit fight"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Fight">
              <IconButton
                color="inherit"
                onClick={handleDelete}
                size="small"
                aria-label="delete fight"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <FightDescription fight={fight} />
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          {fight.actors && fight.actors.length > 0 ? (
            fight.actors.map((actor, index) => (
              <span key={`${actor.id}-${index}`}>
                <Link href={`/characters/${actor.id}`} style={{ color: "#ffffff", textDecoration: "underline" }}>
                  <CharacterName character={actor} />
                </Link>
                {index < fight.actors.length - 1 && ", "}
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
