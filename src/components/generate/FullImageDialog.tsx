"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material"

interface FullImageDialogProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  alt: string
}

export function FullImageDialog({
  open,
  onClose,
  imageUrl,
  alt,
}: FullImageDialogProps) {
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
          minWidth: { xs: "90%", sm: 600 },
          maxWidth: 800,
        },
      }}
    >
      <DialogContent sx={{ bgcolor: "grey.800", color: "white", p: 2 }}>
        <Box
          sx={{
            width: "100%",
            maxHeight: "80vh",
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt={alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "grey.800", p: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { bgcolor: "grey.700" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
