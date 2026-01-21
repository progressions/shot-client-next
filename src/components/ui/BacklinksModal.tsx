"use client"

import { useState, useCallback } from "react"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Icon } from "@/components/ui/Icon"
import BacklinksPanel from "@/components/ui/BacklinksPanel"

type BacklinksModalProps = {
  entityId: string
  entityType: string
  fetchBacklinks: (entityType: string, id: string) => Promise<unknown[]>
}

export default function BacklinksModal({
  entityId,
  entityType,
  fetchBacklinks,
}: BacklinksModalProps) {
  const [open, setOpen] = useState(false)

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <Button
        size="medium"
        variant="text"
        endIcon={<Icon keyword="Link" size={18} color="#fff" />}
        onClick={handleOpen}
        sx={{
          px: 0,
          color: "#fff",
          textTransform: "none",
          fontWeight: 500,
          gap: 0.5,
          minWidth: "auto",
          "&:hover": {
            backgroundColor: "transparent",
            textDecoration: "underline",
          },
        }}
      >
        Backlinks →
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Backlinks</DialogTitle>
        <DialogContent dividers>
          <BacklinksPanel
            entityId={entityId}
            entityType={entityType}
            fetchBacklinks={fetchBacklinks}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
