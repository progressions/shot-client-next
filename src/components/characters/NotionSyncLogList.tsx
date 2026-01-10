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
import type { Character, NotionSyncLog } from "@/types"
import { useClient, useToast, useCampaign } from "@/contexts"
import { SectionHeader, Icon } from "@/components/ui"

interface NotionSyncLogListProps {
  character: Character
}

export default function NotionSyncLogList({
  character,
}: NotionSyncLogListProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { subscribeToEntity } = useCampaign()

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
        const response = await client.getNotionSyncLogs(character.id, {
          page: pageNum,
          per_page: 5,
        })
        setLogs(response.data.notion_sync_logs)
        setTotalPages(response.data.meta.total_pages)
      } catch (error) {
        console.error("Error fetching Notion sync logs:", error)
        toastError("Failed to load Notion sync logs. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [client, character.id, toastError]
  )

  useEffect(() => {
    if (!open) return
    fetchLogs(page)
  }, [fetchLogs, page, open])

  // Subscribe to WebSocket for real-time sync log updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("notion_sync_logs", () => {
      // Reload logs when any notion sync log is created for this campaign
      // The component is already scoped to a specific character via props
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
      await client.syncCharacterToNotion(character.id)
      toastSuccess("Character sync queued")
      // Logs will refresh automatically via WebSocket when sync completes
    } catch (error) {
      console.error("Error syncing character:", error)
      toastError("Failed to queue character sync")
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncFromNotion = async () => {
    try {
      setSyncingFrom(true)
      await client.syncCharacterFromNotion(character.id)
      toastSuccess("Character updated from Notion")
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
      const response = await client.pruneNotionSyncLogs(character.id, 30)
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
        View the history of syncs to Notion for this character.
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
            disabled={syncingFrom || !character.notion_page_id}
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
