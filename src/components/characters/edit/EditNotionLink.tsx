"use client"

import type { Character } from "@/types"
import { NotionLinkDialog } from "@/components/notion"
import { useState } from "react"
import { useClient, useCampaign } from "@/contexts"
import { IconButton, Stack, Tooltip } from "@mui/material"
import LaunchIcon from "@mui/icons-material/Launch"
import LibraryAddIcon from "@mui/icons-material/LibraryAdd"
import { CS } from "@/services"

type EditNotionLinkProps = {
  character: Character
  updateCharacter: (character: Character) => void
}

export default function EditNotionLink({
  character,
  updateCharacter,
}: EditNotionLinkProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useClient()
  const { campaign } = useCampaign()

  // Check if current user can edit Notion link
  const canEditNotionLink = () => {
    if (!user || !campaign) return false

    // Admin can edit any character
    if (user.admin) return true

    // Gamemaster can edit characters in their campaign
    if (campaign.gamemaster?.id === user.id) return true

    return false
  }

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleSave = (
    notionPageId: string | null,
    updatedCharacterFromApi?: Character
  ) => {
    // If we got an updated character from API (e.g., from createNotionPage), use it
    if (updatedCharacterFromApi) {
      updateCharacter(updatedCharacterFromApi)
    } else {
      // Otherwise, just update the notion_page_id
      const updatedCharacter = {
        ...character,
        notion_page_id: notionPageId,
      }
      updateCharacter(updatedCharacter)
    }
  }

  // Don't show if user can't edit
  if (!canEditNotionLink()) {
    return null
  }

  const notionLink = CS.notionLink(character)
  const hasNotionLink = !!character.notion_page_id

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip
          title={hasNotionLink ? "Change Notion Link" : "Link Notion Page"}
        >
          <IconButton onClick={handleOpenDialog} size="small">
            <LibraryAddIcon />
          </IconButton>
        </Tooltip>
        {notionLink && (
          <Tooltip title="Open in Notion">
            <IconButton
              href={notionLink}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              color="primary"
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <NotionLinkDialog
        character={character}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
      />
    </>
  )
}
