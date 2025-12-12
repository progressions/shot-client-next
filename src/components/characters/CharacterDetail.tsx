"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  Box,
  Alert,
  Typography,
  Chip,
  Stack,
} from "@mui/material"
import type { Character } from "@/types"
import { CharacterDescription } from "@/components/characters"
import { useCampaign, useClient, useConfirm } from "@/contexts"
import {
  TypeLink,
  ArchetypeLink,
  FactionLink,
  CharacterLink,
  PositionableImage,
} from "@/components/ui"
import DetailButtons from "@/components/DetailButtons"
import { CS } from "@/services"

interface CharacterDetailProperties {
  character: Character
  onDelete: (characterId: string) => void
  onEdit: (character: Character) => void
}

export default function CharacterDetail({
  character: initialCharacter,
  onDelete,
  onEdit,
}: CharacterDetailProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { confirm } = useConfirm()
  const [error, setError] = useState<string | null>(null)
  const [character, setCharacter] = useState<Character>(initialCharacter)

  useEffect(() => {
    if (
      campaignData?.character &&
      campaignData.character.id === initialCharacter.id
    ) {
      setCharacter(campaignData.character)
    }
  }, [campaignData, initialCharacter])

  const handleDelete = async () => {
    if (!character?.id) return
    const confirmed = await confirm({
      title: "Delete Character",
      message: `Are you sure you want to delete the character: ${character.name}?`,
      confirmText: "Delete",
      destructive: true,
    })
    if (!confirmed) return

    try {
      await client.deleteCharacter(character)
      onDelete(character.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete character"
      )
      console.error("Delete character error:", error_)
    }
  }

  const handleEdit = () => {
    onEdit(character)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = character.created_at
    ? new Date(character.created_at).toLocaleString("en-US", {
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
      <PositionableImage entity={character} pageContext="index" height={200} />
      <CardContent sx={{ p: "1rem" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ color: "#ffffff" }}>
              <CharacterLink character={character} disablePopup={true} />
            </Typography>
            {character.status?.includes("up_check_required") && (
              <Chip
                size="small"
                label="UP CHECK"
                color="warning"
                sx={{ height: "20px", fontSize: "0.7rem", fontWeight: "bold" }}
              />
            )}
            {character.status?.includes("out_of_fight") && (
              <Chip
                size="small"
                label="OUT"
                color="error"
                sx={{ height: "20px", fontSize: "0.7rem", fontWeight: "bold" }}
              />
            )}
            {character.status?.includes("cheesing_it") && (
              <Chip
                size="small"
                label="ESCAPING"
                color="warning"
                sx={{
                  height: "20px",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  animation: "pulse 1s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.6 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
            )}
            {character.status?.includes("cheesed_it") && (
              <Chip
                size="small"
                label="ESCAPED"
                color="success"
                sx={{ height: "20px", fontSize: "0.7rem", fontWeight: "bold" }}
              />
            )}
          </Stack>
          <DetailButtons
            name="Character"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
        <Typography
          component="div"
          variant="caption"
          sx={{ textTransform: "uppercase" }}
        >
          {CS.type(character) && (
            <TypeLink characterType={CS.type(character)} />
          )}
          {CS.archetype(character) && (
            <>
              {" - "}
              <ArchetypeLink archetype={CS.archetype(character)} />
            </>
          )}
          {CS.faction(character) && (
            <>
              {" - "}
              <FactionLink faction={CS.faction(character) as Faction} />
            </>
          )}
        </Typography>
        <CharacterDescription character={character} />
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
