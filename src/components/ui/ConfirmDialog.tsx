"use client"

import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: React.ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionProps={{ timeout: 0 }}
      PaperProps={{
        sx: {
          bgcolor: "grey.800",
          color: "white",
          borderRadius: 2,
          border: "2px solid",
          borderColor: "primary.main",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: "grey.800", color: "white" }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "grey.800", color: "white" }}>
        {children}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "grey.800", p: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { bgcolor: "grey.700" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
