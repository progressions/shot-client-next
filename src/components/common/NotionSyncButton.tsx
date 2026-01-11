"use client"

import { useState, useCallback } from "react"
import {
  Button,
  CircularProgress,
  Stack,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material"
import SyncIcon from "@mui/icons-material/Sync"
import LaunchIcon from "@mui/icons-material/Launch"
import { useClient, useCampaign, useToast } from "@/contexts"
import type { Site, Party, Faction } from "@/types"

type SyncableEntity = Site | Party | Faction

interface NotionSyncButtonProps {
  entity: SyncableEntity
  entityType: "site" | "party" | "faction"
  onSync: (updatedEntity: SyncableEntity) => void
}

export function NotionSyncButton({
  entity,
  entityType,
  onSync,
}: NotionSyncButtonProps) {
  const { client, user } = useClient()
  const { campaign } = useCampaign()
  const { toastSuccess, toastError } = useToast()

  const [isSyncing, setIsSyncing] = useState(false)

  // Check permissions: admin OR gamemaster of current campaign
  const hasPermission =
    user?.admin || (campaign && user?.id === campaign.gamemaster_id)

  const handleSync = useCallback(async () => {
    setIsSyncing(true)
    try {
      let response
      switch (entityType) {
        case "site":
          response = await client.syncSiteToNotion(entity as Site)
          break
        case "party":
          response = await client.syncPartyToNotion(entity as Party)
          break
        case "faction":
          response = await client.syncFactionToNotion(entity as Faction)
          break
      }

      if (response?.data) {
        onSync(response.data)
        toastSuccess(
          `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} synced to Notion`
        )
      }
    } catch (error) {
      console.error(`Error syncing ${entityType} to Notion:`, error)
      toastError(`Failed to sync ${entityType} to Notion`)
    } finally {
      setIsSyncing(false)
    }
  }, [client, entity, entityType, onSync, toastSuccess, toastError])

  // Don't render if user doesn't have permission
  if (!hasPermission) {
    return null
  }

  const hasNotionLink = !!entity.notion_page_id
  const notionLink = hasNotionLink
    ? `https://www.notion.so/isaacrpg/${entity.notion_page_id?.replace(/-/g, "")}`
    : null

  const lastSynced = entity.last_synced_to_notion_at
    ? new Date(entity.last_synced_to_notion_at).toLocaleString()
    : null

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Tooltip
        title={
          hasNotionLink
            ? `Sync to Notion${lastSynced ? ` (last synced: ${lastSynced})` : ""}`
            : "Create Notion page"
        }
      >
        <Button
          variant="outlined"
          size="small"
          onClick={handleSync}
          disabled={isSyncing}
          startIcon={isSyncing ? <CircularProgress size={16} /> : <SyncIcon />}
        >
          {hasNotionLink ? "Sync to Notion" : "Create in Notion"}
        </Button>
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

      {lastSynced && (
        <Typography variant="caption" color="text.secondary">
          Last synced: {lastSynced}
        </Typography>
      )}
    </Stack>
  )
}

export default NotionSyncButton
