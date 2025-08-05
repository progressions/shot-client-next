"use client"

import { useEffect, useState } from "react"
import {
  Alert,
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
} from "@mui/material"
import type { Party } from "@/types"
import Link from "next/link"
import { PartyName, PartyDescription } from "@/components/parties"
import { useCampaign, useClient } from "@/contexts"
import { CharacterLink, FactionLink } from "@/components/ui"
import DetailButtons from "@/components/DetailButtons"

interface PartyDetailProperties {
  party: Party
  onDelete: (partyId: string) => void
  onEdit: (party: Party) => void
}

export default function PartyDetail({
  party: initialParty,
  onDelete,
  onEdit,
}: PartyDetailProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [party, setParty] = useState<Party>(initialParty)

  useEffect(() => {
    if (campaignData?.party && campaignData.party.id === initialParty.id) {
      setParty(campaignData.party)
    }
  }, [campaignData, initialParty])

  const handleDelete = async () => {
    if (!party?.id) return
    if (!confirm(`Are you sure you want to delete the party: ${party.name}?`))
      return

    try {
      await client.deleteParty(party)
      onDelete(party.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete party"
      )
      console.error("Delete party error:", error_)
    }
  }

  const handleEdit = () => {
    onEdit(party)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = party.created_at
    ? new Date(party.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown"

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      {party.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={`${party.image_url}?tr=w-900,h-300,fo-face,z-0.5`}
          alt={party.name}
          sx={{ objectFit: "cover" }}
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
            <Link href={`/parties/${party.id}`} style={{ color: "#fff" }}>
              <PartyName party={party} />
            </Link>
          </Typography>
          <DetailButtons
            name="Party"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
        {party.faction && (
          <Typography
            variant="body1"
            sx={{
              textTransform: "lowercase",
              fontVariant: "small-caps",
              mb: 2,
              color: "#ffffff",
            }}
          >
            Belongs to <FactionLink faction={party.faction} />
          </Typography>
        )}
        <PartyDescription party={party} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          {party.characters && party.characters.length > 0
            ? party.characters.map((actor, index) => (
                <span key={`${actor.id}-${index}`}>
                  <CharacterLink character={actor} />
                  {index < party.characters.length - 1 && ", "}
                </span>
              ))
            : null}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, color: "#ffffff" }}>
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
