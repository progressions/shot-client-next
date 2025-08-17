"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Alert,
  Typography,
} from "@mui/material"
import type { Juncture } from "@/types"
import Link from "next/link"
import { JunctureName, JunctureDescription } from "@/components/junctures"
import { useCampaign, useClient } from "@/contexts"
import { CharacterLink, FactionLink } from "@/components/ui"
import DetailButtons from "@/components/DetailButtons"

interface JunctureDetailProperties {
  juncture: Juncture
  onDelete: (junctureId: string) => void
  onEdit: (juncture: Juncture) => void
}

export default function JunctureDetail({
  juncture: initialJuncture,
  onDelete,
  onEdit,
}: JunctureDetailProperties) {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [juncture, setJuncture] = useState<Juncture>(initialJuncture)

  // Subscribe to juncture updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("juncture", data => {
      if (data && data.id === initialJuncture.id) {
        setJuncture({ ...data })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialJuncture.id])

  const handleDelete = async () => {
    if (!juncture?.id) return
    if (
      !confirm(
        `Are you sure you want to delete the juncture: ${juncture.name}?`
      )
    )
      return

    try {
      await client.deleteJuncture(juncture)
      onDelete(juncture.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete juncture"
      )
      console.error("Delete juncture error:", error_)
    }
  }

  const handleEdit = () => {
    onEdit(juncture)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = juncture.created_at
    ? new Date(juncture.created_at).toLocaleString("en-US", {
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
      {juncture.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={juncture.image_url}
          alt={juncture.name}
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
            <Link href={`/junctures/${juncture.id}`} style={{ color: "#fff" }}>
              <JunctureName juncture={juncture} />
            </Link>
          </Typography>
          <DetailButtons
            name="Juncture"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
        {juncture.faction && (
          <Typography
            variant="body1"
            sx={{
              textTransform: "lowercase",
              fontVariant: "small-caps",
              mb: 2,
              color: "#ffffff",
            }}
          >
            Controlled by <FactionLink faction={juncture.faction} />
          </Typography>
        )}
        <JunctureDescription juncture={juncture} />
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          {juncture.characters && juncture.characters.length > 0
            ? juncture.characters.map((actor, index) => (
                <span key={`${actor.id}-${index}`}>
                  <CharacterLink character={actor} />
                  {index < juncture.characters.length - 1 && ", "}
                </span>
              ))
            : null}
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
