"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, Box, Alert, IconButton, Tooltip } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import type { Fight } from "@/types/types"
import Link from "next/link"
import { FightName, FightDescription } from "@/components/fights"
import { useCampaign, useClient } from "@/contexts"

interface FightDetailProps {
  fight: Fight
  onDelete: (fightId: string) => void
  onUpdate: () => void
  onEdit: (fight: Fight) => void
}

export default function FightDetail({ fight: initialFight, onDelete, onUpdate, onEdit }: FightDetailProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [fight, setFight] = useState<Fight>(initialFight)

  useEffect(() => {
    if (campaignData?.fight) {
      setFight({ ...initialFight, name: campaignData.fight.name || initialFight.name, description: campaignData.fight.description || initialFight.description })
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

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: "1rem" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href={`/fights/${fight.id}`} style={{ color: "#fff" }}>
            <FightName fight={fight} />
          </Link>
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
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
