"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Collapse,
  Pagination,
  CircularProgress,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import SyncIcon from "@mui/icons-material/Sync"
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import type {
  Adventure,
  Character,
  Faction,
  Party,
  Site,
  Juncture,
  NotionSyncLog,
  NotionSyncLogsResponse,
} from "@/types"
import { useClient, useToast, useCampaign } from "@/contexts"
import { SectionHeader, Icon } from "@/components/ui"

type NotionSyncEntity =
  | Adventure
  | Character
  | Site
  | Party
  | Faction
  | Juncture

type NotionEntityType =
  | "adventure"
  | "character"
  | "site"
  | "party"
  | "faction"
  | "juncture"

type PruneResponse = {
  pruned_count: number
  days_old: number
  message: string
}

interface NotionSyncLogListProps {
  entity: NotionSyncEntity
  entityType: NotionEntityType
  onSync?: (entity: NotionSyncEntity) => void
}

export default function NotionSyncLogList({
  entity,
  entityType,
  onSync,
}: NotionSyncLogListProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { subscribeToEntity } = useCampaign()
  const entityLabel = `${entityType.charAt(0).toUpperCase()}${entityType.slice(1)}`

  const [logs, setLogs] = useState<NotionSyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncingFrom, setSyncingFrom] = useState(false)
  const [pruning, setPruning] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [open, setOpen] = useState(false)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const fetchLogs = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true)
        let response: { data: NotionSyncLogsResponse } | null = null
        const params = { page: pageNum, per_page: 5 }

        switch (entityType) {
          case "adventure":
            response = await client.getNotionSyncLogsForAdventure(
              entity.id,
              params
            )
            break
          case "character":
            response = await client.getNotionSyncLogs(entity.id, params)
            break
          case "site":
            response = await client.getNotionSyncLogsForSite(entity.id, params)
            break
          case "party":
            response = await client.getNotionSyncLogsForParty(entity.id, params)
            break
          case "faction":
            response = await client.getNotionSyncLogsForFaction(
              entity.id,
              params
            )
            break
          case "juncture":
            response = await client.getNotionSyncLogsForJuncture(
              entity.id,
              params
            )
            break
          default:
            throw new Error(`Unsupported entity type: ${entityType}`)
        }

        if (!response) {
          throw new Error(`Unsupported entity type: ${entityType}`)
        }

        setLogs(response.data.notion_sync_logs)
        setTotalPages(response.data.meta.total_pages)
      } catch (error) {
        console.error("Error fetching Notion sync logs:", error)
        toastError("Failed to load Notion sync logs. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [client, entity.id, entityType, toastError]
  )

  useEffect(() => {
    if (!open) return
    fetchLogs(page)
  }, [fetchLogs, page, open])

  // Subscribe to WebSocket for real-time sync log updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("notion_sync_logs", () => {
      // Reload logs when any notion sync log is created for this campaign
      // The component is already scoped to a specific entity via props
      if (open) {
        setPage(1)
        fetchLogs(1)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchLogs, open])

  const handleSync = async () => {
    try {
      setSyncing(true)
      switch (entityType) {
        case "adventure": {
          const response = await client.syncAdventureToNotion(entity.id)
          toastSuccess("Adventure synced to Notion")
          onSync?.(response.data)
          break
        }
        case "character":
          await client.syncCharacterToNotion(entity.id)
          toastSuccess("Character sync queued")
          break
        case "site": {
          const response = await client.syncSiteToNotion(entity.id)
          toastSuccess("Site synced to Notion")
          onSync?.(response.data)
          break
        }
        case "party": {
          const response = await client.syncPartyToNotion(entity.id)
          toastSuccess("Party synced to Notion")
          onSync?.(response.data)
          break
        }
        case "faction": {
          const response = await client.syncFactionToNotion(entity.id)
          toastSuccess("Faction synced to Notion")
          onSync?.(response.data)
          break
        }
        case "juncture": {
          const response = await client.syncJunctureToNotion(entity.id)
          toastSuccess("Juncture synced to Notion")
          onSync?.(response.data)
          break
        }
        default:
          throw new Error(`Unsupported entity type: ${entityType}`)
      }
      // Logs will refresh automatically via WebSocket when sync completes
    } catch (error) {
      console.error(`Error syncing ${entityType}:`, error)
      toastError(`Failed to sync ${entityLabel.toLowerCase()} to Notion`)
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncFromNotion = async () => {
    try {
      setSyncingFrom(true)
      const response: { data: NotionSyncEntity } = await (async () => {
        switch (entityType) {
          case "adventure":
            return client.syncAdventureFromNotion(entity.id)
          case "character":
            return client.syncCharacterFromNotion(entity.id)
          case "site":
            return client.syncSiteFromNotion(entity.id)
          case "party":
            return client.syncPartyFromNotion(entity.id)
          case "faction":
            return client.syncFactionFromNotion(entity.id)
          case "juncture":
            return client.syncJunctureFromNotion(entity.id)
          default:
            throw new Error(`Unsupported entity type: ${entityType}`)
        }
      })()

      toastSuccess(`${entityLabel} updated from Notion`)
      onSync?.(response.data)
      // Refresh logs to show any changes
      if (open) {
        fetchLogs(1)
      }
    } catch (error) {
      console.error("Error syncing from Notion:", error)
      toastError("Failed to sync from Notion")
    } finally {
      setSyncingFrom(false)
    }
  }

  const handlePrune = async () => {
    try {
      setPruning(true)
      let response: { data: PruneResponse } | null = null
      switch (entityType) {
        case "adventure":
          response = await client.pruneNotionSyncLogsForAdventure(entity.id, 30)
          break
        case "character":
          response = await client.pruneNotionSyncLogs(entity.id, 30)
          break
        case "site":
          response = await client.pruneNotionSyncLogsForSite(entity.id, 30)
          break
        case "party":
          response = await client.pruneNotionSyncLogsForParty(entity.id, 30)
          break
        case "faction":
          response = await client.pruneNotionSyncLogsForFaction(entity.id, 30)
          break
        case "juncture":
          response = await client.pruneNotionSyncLogsForJuncture(entity.id, 30)
          break
        default:
          throw new Error(`Unsupported entity type: ${entityType}`)
      }

      if (!response) {
        throw new Error(`Unsupported entity type: ${entityType}`)
      }

      const { pruned_count } = response.data
      if (pruned_count > 0) {
        toastSuccess(
          `Deleted ${pruned_count} sync log${pruned_count === 1 ? "" : "s"} older than 30 days`
        )
        // Refresh logs after pruning
        setPage(1)
        fetchLogs(1)
      } else {
        toastSuccess("No logs older than 30 days to prune")
      }
    } catch (error) {
      console.error("Error pruning sync logs:", error)
      toastError("Failed to prune sync logs")
    } finally {
      setPruning(false)
    }
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const toggleLogDetails = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId)
  }

  return (
    <Box sx={{ mt: 3 }}>
      <SectionHeader
        title="Notion Sync History"
        icon={<Icon keyword="Notion" />}
        actions={
          <Button
            variant="contained"
            size="small"
            onClick={() => setOpen(!open)}
            endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ px: 1.5 }}
          >
            {open ? "Hide" : "Show"}
          </Button>
        }
      >
        View the history of syncs to Notion for this {entityLabel.toLowerCase()}
        .
      </SectionHeader>

      <Collapse in={open}>
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
          sx={{ mb: 2, mt: 1 }}
        >
          <Button
            variant="outlined"
            startIcon={syncing ? <CircularProgress size={16} /> : <SyncIcon />}
            onClick={handleSync}
            disabled={syncing}
            size="small"
          >
            {syncing ? "Syncing..." : "Sync to Notion"}
          </Button>
          <Button
            variant="outlined"
            startIcon={
              syncingFrom ? <CircularProgress size={16} /> : <SyncIcon />
            }
            onClick={handleSyncFromNotion}
            disabled={syncingFrom || !entity.notion_page_id}
            size="small"
          >
            {syncingFrom ? "Syncing..." : "Sync from Notion"}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={
              pruning ? <CircularProgress size={16} /> : <DeleteSweepIcon />
            }
            onClick={handlePrune}
            disabled={pruning || logs.length === 0}
            size="small"
          >
            {pruning ? "Pruning..." : "Prune Old Logs"}
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 2, textAlign: "center" }}
          >
            No sync history available.
          </Typography>
        ) : (
          <Stack direction="column" spacing={1}>
            {logs.map(log => (
              <Box
                key={log.id}
                sx={theme => ({
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: "hidden",
                })}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ p: 1.5, cursor: "pointer" }}
                  onClick={() => toggleLogDetails(log.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleLogDetails(log.id)
                    }
                  }}
                >
                  {log.status === "success" ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Success"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<ErrorIcon />}
                      label="Error"
                      color="error"
                      size="small"
                    />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(log.created_at)}
                  </Typography>
                  {log.error_message && (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{
                        ml: "auto",
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {log.error_message}
                    </Typography>
                  )}
                  <Box sx={{ ml: log.error_message ? undefined : "auto" }}>
                    {expandedLogId === log.id ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                  </Box>
                </Stack>

                <Collapse in={expandedLogId === log.id}>
                  <Box sx={{ p: 1.5, pt: 0 }}>
                    <Stack spacing={2}>
                      {log.error_message && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="error"
                            gutterBottom
                          >
                            Error Message
                          </Typography>
                          <Typography variant="body2">
                            {log.error_message}
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Payload
                        </Typography>
                        <Box
                          component="pre"
                          sx={theme => ({
                            backgroundColor: theme.palette.background.default,
                            p: 1,
                            borderRadius: 1,
                            overflow: "auto",
                            maxHeight: "200px",
                            fontSize: "0.75rem",
                          })}
                        >
                          {JSON.stringify(log.payload, null, 2)}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Response
                        </Typography>
                        <Box
                          component="pre"
                          sx={theme => ({
                            backgroundColor: theme.palette.background.default,
                            p: 1,
                            borderRadius: 1,
                            overflow: "auto",
                            maxHeight: "200px",
                            fontSize: "0.75rem",
                          })}
                        >
                          {JSON.stringify(log.response, null, 2)}
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Collapse>
              </Box>
            ))}

            <Pagination
              count={totalPages || 1}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              color="primary"
              shape="rounded"
              size="medium"
              sx={{ mt: 2, display: "flex", justifyContent: "center" }}
            />
          </Stack>
        )}
      </Collapse>
    </Box>
  )
}
