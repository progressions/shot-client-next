"use client"

import { useEffect, useState } from "react"
import { Stack, Card, CardContent, Box, Alert, Typography } from "@mui/material"
import type { Fight } from "@/types"
import { FightDescription } from "@/components/fights"
import { useCampaign, useClient } from "@/contexts"
import { FightLink, CharacterLink } from "@/components/links"
import DetailButtons from "@/components/DetailButtons"
import { PositionableImage } from "@/components/ui"
import { Icon } from "@/lib"

interface FightDetailProperties {
  fight: Fight
  onDelete: (fightId: string) => void
  onEdit: (fight: Fight) => void
  isMobile?: boolean
}

export default function FightDetail({
  fight: initialFight,
  onDelete,
  onEdit,
  isMobile = false,
}: FightDetailProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [fight, setFight] = useState<Fight>(initialFight)

  useEffect(() => {
    if (campaignData?.fight && campaignData.fight.id === initialFight.id) {
      console.log("Updating fight from campaign data:", campaignData.fight)
      setFight(campaignData.fight)
    }
  }, [campaignData, initialFight])

  const handleDelete = async () => {
    if (!fight?.id) return
    if (!confirm(`Are you sure you want to delete the fight: ${fight.name}?`))
      return

    try {
      await client.deleteFight(fight)
      onDelete(fight.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete fight"
      )
      console.error("Delete fight error:", error_)
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
        hour12: true,
      })
    : "Unknown"

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      {fight.image_url && (
        <PositionableImage
          entity={fight}
          pageContext="index"
          height="200"
          isMobile={isMobile}
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
            <FightLink fight={fight} disablePopup={true} />
          </Typography>
          <DetailButtons
            name="Fight"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
        <FightDescription fight={fight} />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <Icon keyword="Characters" />{" "}
          <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
            {fight.actors && fight.actors.length > 0
              ? fight.actors.map((actor, index) => (
                  <span key={`${actor.id}-${index}`}>
                    <CharacterLink character={actor} />
                    {index < fight.actors.length - 1 && ", "}
                  </span>
                ))
              : "No fighters yet!"}
          </Typography>
        </Stack>
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
