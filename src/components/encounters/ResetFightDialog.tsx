"use client"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material"
import { useState } from "react"
import { FaArrowRotateLeft } from "react-icons/fa6"

interface ResetFightDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (deleteEvents: boolean) => void
  fightName: string
}

export default function ResetFightDialog({
  open,
  onClose,
  onConfirm,
  fightName,
}: ResetFightDialogProps) {
  const [deleteEvents, setDeleteEvents] = useState(false)

  const handleConfirm = () => {
    onConfirm(deleteEvents)
    setDeleteEvents(false)
  }

  const handleClose = () => {
    onClose()
    setDeleteEvents(false)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FaArrowRotateLeft color="#2196f3" />
        Reset Fight: {fightName}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          This will reset the fight to its initial state. All initiative values
          and combat progress will be cleared.
        </Alert>
        <DialogContentText sx={{ mb: 2 }}>
          Resetting the fight will:
        </DialogContentText>
        <ul style={{ marginTop: 0, marginBottom: 16 }}>
          <li>Reset the sequence counter to 0</li>
          <li>Clear all initiative values</li>
          <li>Reset impairments and wound counts on shots</li>
          <li>Clear the fight start/end timestamps</li>
        </ul>
        <FormControlLabel
          control={
            <Checkbox
              checked={deleteEvents}
              onChange={e => setDeleteEvents(e.target.checked)}
            />
          }
          label="Also delete all fight events (combat log)"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          autoFocus
        >
          Reset Fight
        </Button>
      </DialogActions>
    </Dialog>
  )
}
