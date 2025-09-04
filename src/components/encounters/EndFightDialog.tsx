"use client"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from "@mui/material"
import { useState } from "react"
import { FaTriangleExclamation } from "react-icons/fa6"

interface EndFightDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (notes?: string) => void
  fightName: string
}

export default function EndFightDialog({
  open,
  onClose,
  onConfirm,
  fightName,
}: EndFightDialogProps) {
  const [notes, setNotes] = useState("")

  const handleConfirm = () => {
    onConfirm(notes || undefined)
    setNotes("")
  }

  const handleClose = () => {
    onClose()
    setNotes("")
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FaTriangleExclamation color="#ff9800" />
        End Fight: {fightName}
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone. Once ended, the fight will be closed 
          and no further modifications will be allowed.
        </Alert>
        <DialogContentText sx={{ mb: 2 }}>
          Are you sure you want to end this fight? All participants will be 
          notified and the fight will become read-only.
        </DialogContentText>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Closing Notes (Optional)"
          placeholder="Add any notes about how the fight ended..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          color="error" 
          variant="contained"
          autoFocus
        >
          End Fight
        </Button>
      </DialogActions>
    </Dialog>
  )
}