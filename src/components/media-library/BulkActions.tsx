"use client"
import { Button, Typography, Paper } from "@mui/material"
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  SelectAll as SelectAllIcon,
  Close as ClearIcon,
} from "@mui/icons-material"

interface BulkActionsProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkDelete: () => void
  onBulkDownload: () => void
}

export default function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkDownload,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <Paper
      elevation={3}
      sx={theme => ({
        position: "sticky",
        top: 80,
        zIndex: 10,
        p: 2,
        mb: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        backgroundColor: theme.palette.background.paper,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
      })}
    >
      <Typography variant="body1" sx={{ flexGrow: 1 }}>
        {selectedCount} of {totalCount} selected
      </Typography>

      <Button
        size="small"
        startIcon={<SelectAllIcon />}
        onClick={onSelectAll}
        disabled={selectedCount === totalCount}
      >
        Select All
      </Button>

      <Button size="small" startIcon={<ClearIcon />} onClick={onClearSelection}>
        Clear
      </Button>

      <Button
        size="small"
        startIcon={<DownloadIcon />}
        onClick={onBulkDownload}
        variant="outlined"
      >
        Download
      </Button>

      <Button
        size="small"
        startIcon={<DeleteIcon />}
        onClick={onBulkDelete}
        variant="contained"
        color="error"
      >
        Delete
      </Button>
    </Paper>
  )
}
