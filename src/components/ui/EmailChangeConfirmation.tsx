"use client"

import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material"

interface EmailChangeConfirmationProps {
  open: boolean
  currentEmail: string
  newEmail: string
  onConfirm: () => void
  onCancel: () => void
}

export function EmailChangeConfirmation({
  open,
  currentEmail,
  newEmail,
  onConfirm,
  onCancel,
}: EmailChangeConfirmationProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onCancel()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      onKeyDown={handleKeyDown}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ timeout: 0 }}
      PaperProps={{
        sx: {
          bgcolor: "grey.800",
          color: "white",
          borderRadius: 2,
          border: "2px solid",
          borderColor: "warning.main",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
        },
      }}
      aria-labelledby="email-change-dialog-title"
      aria-describedby="email-change-dialog-description"
    >
      <DialogTitle
        id="email-change-dialog-title"
        sx={{ bgcolor: "grey.800", color: "white" }}
      >
        Confirm Email Address Change
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "grey.800", color: "white" }}>
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            bgcolor: "warning.dark",
            color: "white",
            "& .MuiAlert-icon": {
              color: "warning.light",
            },
          }}
        >
          Changing your email address will affect your login credentials and
          account recovery options.
        </Alert>

        <Typography
          variant="body1"
          gutterBottom
          id="email-change-dialog-description"
        >
          Are you sure you want to change your email address?
        </Typography>

        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "grey.700",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "grey.600",
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Current email:</strong> {currentEmail}
          </Typography>
          <Typography variant="body2">
            <strong>New email:</strong> {newEmail}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          You will need to use the new email address for future logins.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "grey.800", p: 2 }}>
        <Button
          onClick={onCancel}
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
            bgcolor: "warning.main",
            color: "black",
            "&:hover": { bgcolor: "warning.dark" },
          }}
        >
          Confirm Change
        </Button>
      </DialogActions>
    </Dialog>
  )
}
