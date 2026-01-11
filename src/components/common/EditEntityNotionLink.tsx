"use client"

import type { Site, Party, Faction } from "@/types"
import { EntityNotionLinkDialog } from "@/components/notion"
import type { EntityType } from "@/components/autocomplete/EntityNotionPageAutocomplete"
import { useState } from "react"
import { useClient, useCampaign } from "@/contexts"
import { IconButton, Stack, Tooltip } from "@mui/material"
import LaunchIcon from "@mui/icons-material/Launch"
import LibraryAddIcon from "@mui/icons-material/LibraryAdd"

type NotionLinkableEntity = Site | Party | Faction

type EditEntityNotionLinkProps<T extends NotionLinkableEntity> = {
  entity: T
  entityType: EntityType
  updateEntity: (entity: T) => void
}

function getNotionLink(entity: NotionLinkableEntity): string | null {
  return entity?.notion_page_id
    ? `https://www.notion.so/isaacrpg/${entity.notion_page_id.replaceAll("-", "")}`
    : null
}

export default function EditEntityNotionLink<T extends NotionLinkableEntity>({
  entity,
  entityType,
  updateEntity,
}: EditEntityNotionLinkProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useClient()
  const { campaign } = useCampaign()

  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1)

  // Check if current user can edit Notion link
  const canEditNotionLink = () => {
    if (!user || !campaign) return false

    // Admin can edit any entity
    if (user.admin) return true

    // Gamemaster can edit entities in their campaign
    if (campaign.gamemaster_id === user.id) return true

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
    updatedEntityFromApi?: T
  ) => {
    // If we got an updated entity from API (e.g., from sync/create), use it
    if (updatedEntityFromApi) {
      updateEntity(updatedEntityFromApi)
    } else {
      // Otherwise, just update the notion_page_id
      const updatedEntity = {
        ...entity,
        notion_page_id: notionPageId,
      } as T
      updateEntity(updatedEntity)
    }
  }

  // Don't show if user can't edit
  if (!canEditNotionLink()) {
    return null
  }

  const notionLink = getNotionLink(entity)
  const hasNotionLink = !!entity.notion_page_id

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip
          title={
            hasNotionLink
              ? `Change ${entityLabel} Notion Link`
              : `Link ${entityLabel} to Notion`
          }
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

      <EntityNotionLinkDialog
        entity={entity}
        entityType={entityType}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
      />
    </>
  )
}
