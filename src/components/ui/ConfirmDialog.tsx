"use client"

import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  children?: React.ReactNode
  message?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: "primary" | "error" | "warning" | "success"
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  children,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "primary",
  destructive = false,
}: ConfirmDialogProps) {
  const buttonColor = destructive ? "error" : confirmColor
  const borderColor = destructive ? "error.main" : `${confirmColor}.main`

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
          borderColor: borderColor,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
          minWidth: 320,
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: "grey.800", color: "white" }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "grey.800", color: "white" }}>
        {children || (
          <Typography sx={{ whiteSpace: "pre-line" }}>{message}</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "grey.800", p: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { bgcolor: "grey.700" },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={buttonColor}
          autoFocus
          sx={{
            color: "white",
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
