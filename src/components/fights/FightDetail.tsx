"use client"

import { useEffect, useState } from "react"
import { Stack, Card, CardContent, Box, Typography } from "@mui/material"
import type { Fight } from "@/types"
import { FightChips, FightDescription } from "@/components/fights"
import { useToast, useCampaign, useClient } from "@/contexts"
import DetailButtons from "@/components/DetailButtons"
import {
  Icon,
  FightLink,
  CharacterLink,
  PositionableImage,
} from "@/components/ui"
import { useRouter } from "next/navigation"

interface FightDetailProperties {
  fight: Fight
  onDelete: (fightId: string) => void
  isMobile?: boolean
}

export default function FightDetail({
  fight: initialFight,
  onDelete,
  isMobile = false,
}: FightDetailProperties) {
  const router = useRouter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { campaignData } = useCampaign()
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
      toastSuccess(`Fight "${fight.name}" deleted successfully!`)
    } catch (error_) {
      console.error("Delete fight error:", error_)
      toastError("Failed to delete fight.")
    }
  }

  const handleEdit = () => {
    router.push(`/fights/${fight.id}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  // Format created_at timestamp for display
  const formattedStartedAt = fight.started_at
    ? formatDate(fight.started_at)
    : "Unstarted"
  const formattedEndedAt = fight.ended_at
    ? formatDate(fight.ended_at)
    : "Unknown"

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      <PositionableImage
        entity={fight}
        pageContext="index"
        height="200"
        isMobile={isMobile}
      />
      <CardContent sx={{ p: "1rem" }}>
        <FightChips fight={fight} />
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
            {fight.characters && fight.characters.length > 0
              ? fight.characters.map((actor, index) => (
                  <span key={`${actor.id}-${index}`}>
                    <CharacterLink character={actor} />
                    {index < fight.characters.length - 1 && ", "}
                  </span>
                ))
              : "No fighters yet!"}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          Started: {formattedStartedAt}
        </Typography>
        {fight.started_at && !fight.ended_at && (
          <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
            Ongoing since: {formattedStartedAt}
          </Typography>
        )}
        {fight.ended_at && (
          <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
            Ended: {formattedEndedAt}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
