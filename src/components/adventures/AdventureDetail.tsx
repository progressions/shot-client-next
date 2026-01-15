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
import type { Adventure } from "@/types"
import Link from "next/link"
import { useCampaign, useClient, useConfirm } from "@/contexts"
import { CharacterLink } from "@/components/ui"
import DetailButtons from "@/components/DetailButtons"
import { RichTextRenderer } from "@/components/editor"

interface AdventureDetailProperties {
  adventure: Adventure
  onDelete: (adventureId: string) => void
  onEdit?: (adventure: Adventure) => void
}

export default function AdventureDetail({
  adventure: initialAdventure,
  onDelete,
  onEdit,
}: AdventureDetailProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { confirm } = useConfirm()
  const [error, setError] = useState<string | null>(null)
  const [adventure, setAdventure] = useState<Adventure>(initialAdventure)

  useEffect(() => {
    if (
      campaignData?.adventure &&
      campaignData.adventure.id === initialAdventure.id
    ) {
      setAdventure(campaignData.adventure)
    }
  }, [campaignData, initialAdventure])

  const handleDelete = async () => {
    if (!adventure?.id) return
    const confirmed = await confirm({
      title: "Delete Adventure",
      message: `Are you sure you want to delete the adventure: ${adventure.name}?`,
      confirmText: "Delete",
      destructive: true,
    })
    if (!confirmed) return

    try {
      await client.deleteAdventure(adventure)
      onDelete(adventure.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete adventure"
      )
      console.error("Delete adventure error:", error_)
    }
  }

  const handleEdit = onEdit
    ? () => {
        onEdit(adventure)
      }
    : undefined

  const formattedCreatedAt = adventure.created_at
    ? new Date(adventure.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown"

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      {adventure.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={`${adventure.image_url}?tr=w-900,h-300,fo-face,z-0.5`}
          alt={adventure.name}
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
            <Link
              href={`/adventures/${adventure.id}`}
              style={{ color: "#fff" }}
            >
              {adventure.name}
            </Link>
          </Typography>
          <DetailButtons
            name="Adventure"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
        {adventure.season && (
          <Typography
            variant="body1"
            sx={{
              textTransform: "lowercase",
              fontVariant: "small-caps",
              mb: 2,
              color: "#ffffff",
            }}
          >
            Season {adventure.season}
          </Typography>
        )}
        {adventure.description && (
          <RichTextRenderer html={adventure.description} />
        )}
        {adventure.characters && adventure.characters.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: "#ffffff", mb: 1 }}>
              Heroes:
            </Typography>
            <Typography variant="body2">
              {adventure.characters.map((character, index) => (
                <span key={`${character.id}-${index}`}>
                  <CharacterLink character={character} />
                  {index < adventure.characters.length - 1 && ", "}
                </span>
              ))}
            </Typography>
          </Box>
        )}
        {adventure.villains && adventure.villains.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: "#ffffff", mb: 1 }}>
              Villains:
            </Typography>
            <Typography variant="body2">
              {adventure.villains.map((villain, index) => (
                <span key={`${villain.id}-${index}`}>
                  <CharacterLink character={villain} />
                  {index < adventure.villains.length - 1 && ", "}
                </span>
              ))}
            </Typography>
          </Box>
        )}
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
