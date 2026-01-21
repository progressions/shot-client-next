"use client"

import { useState, useCallback } from "react"
import { Button, Stack } from "@mui/material"
import { Icon } from "@/components/ui/Icon"
import BacklinksPanel from "@/components/ui/BacklinksPanel"
import { DialogBox } from "@/components/ui/DialogBox"

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
      <DialogBox
        open={open}
        onClose={handleClose}
        title="Backlinks"
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleClose}>
              Close
            </Button>
          </Stack>
        }
      >
        <BacklinksPanel
          entityId={entityId}
          entityType={entityType}
          fetchBacklinks={fetchBacklinks}
          showHeader={false}
          showCountChip={false}
        />
      </DialogBox>
    </>
  )
}
