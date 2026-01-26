"use client"

import { useState, useEffect } from "react"
import {
  Popover,
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  IconButton,
} from "@mui/material"
import { Delete as DeleteIcon } from "@mui/icons-material"
import type { LocationConnection } from "@/types"

interface ConnectionPopoverProps {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  onSave: (data: { label?: string; bidirectional?: boolean }) => void
  onDelete?: () => void
  /** Initial values when editing an existing connection */
  connection?: LocationConnection | null
  /** Whether this is for creating a new connection */
  isNewConnection?: boolean
}

/**
 * ConnectionPopover provides a form for editing connection properties.
 * Shows label input, bidirectional toggle, and save/cancel/delete buttons.
 */
export default function ConnectionPopover({
  open,
  anchorEl,
  onClose,
  onSave,
  onDelete,
  connection,
  isNewConnection = false,
}: ConnectionPopoverProps) {
  const [label, setLabel] = useState("")
  const [bidirectional, setBidirectional] = useState(true)

  // Reset form when connection changes or popover opens
  useEffect(() => {
    if (open) {
      setLabel(connection?.label || "")
      setBidirectional(connection?.bidirectional ?? true)
    }
  }, [open, connection])

  const handleSave = () => {
    onSave({ label: label.trim() || undefined, bidirectional })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      slotProps={{
        paper: {
          sx: { p: 2, minWidth: 250 },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {isNewConnection ? "New Connection" : "Edit Connection"}
        </Typography>

        <TextField
          label="Label (optional)"
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          fullWidth
          autoFocus={isNewConnection}
          placeholder="e.g., Stairs, Door, etc."
        />

        <FormControlLabel
          control={
            <Switch
              checked={bidirectional}
              onChange={e => setBidirectional(e.target.checked)}
              color="primary"
            />
          }
          label="Two-way connection"
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          {!isNewConnection && onDelete && (
            <IconButton
              onClick={onDelete}
              color="error"
              size="small"
              title="Delete connection"
            >
              <DeleteIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose} size="small">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" size="small">
            {isNewConnection ? "Create" : "Save"}
          </Button>
        </Box>
      </Box>
    </Popover>
  )
}
