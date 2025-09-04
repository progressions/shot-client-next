"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { useEncounter, useClient, useToast } from "@/contexts"
import type { Character } from "@/types"

interface OtherActionDialogProps {
  open: boolean
  onClose: () => void
  character: Character
}

export default function OtherActionDialog({
  open,
  onClose,
  character,
}: OtherActionDialogProps) {
  const { encounter, updateEncounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  
  const [actionName, setActionName] = useState("")
  const [shotCost, setShotCost] = useState("3")
  const [notes, setNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApply = async () => {
    if (!actionName.trim()) {
      toastError("Please enter an action name")
      return
    }

    const cost = parseInt(shotCost, 10)
    if (isNaN(cost) || cost < 0 || cost > 10) {
      toastError("Shot cost must be between 0 and 10")
      return
    }

    setIsProcessing(true)

    try {
      // For now, just simulate the action with a success message
      // In the future, this could call an API endpoint to track the action
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
      
      let message = `${character.name} performed ${actionName}`
      if (cost > 0) {
        message += ` (${cost} shot${cost !== 1 ? "s" : ""})`
      }
      if (notes) {
        message += ` - ${notes}`
      }
      
      toastSuccess(message)

      // Reset form and close
      setActionName("")
      setShotCost("3")
      setNotes("")
      onClose()
    } catch (error) {
      console.error("Failed to apply other action:", error)
      toastError("Failed to apply action")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setActionName("")
      setShotCost("3")
      setNotes("")
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">
          ⏱️ Other Action - {character.name}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Action Name"
            value={actionName}
            onChange={(e) => setActionName(e.target.value)}
            fullWidth
            autoFocus
            placeholder="e.g., Reload, Hide, Intimidate, etc."
            disabled={isProcessing}
          />
          
          <FormControl fullWidth>
            <InputLabel>Shot Cost</InputLabel>
            <Select
              value={shotCost}
              onChange={(e) => setShotCost(e.target.value)}
              label="Shot Cost"
              disabled={isProcessing}
            >
              <MenuItem value="0">0 shots (free action)</MenuItem>
              <MenuItem value="1">1 shot</MenuItem>
              <MenuItem value="2">2 shots</MenuItem>
              <MenuItem value="3">3 shots (standard)</MenuItem>
              <MenuItem value="4">4 shots</MenuItem>
              <MenuItem value="5">5 shots</MenuItem>
              <MenuItem value="6">6 shots</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Any additional details about the action..."
            disabled={isProcessing}
          />
          
          <Typography variant="caption" color="text.secondary">
            Use this for any action not covered by the standard action panels
            (Attack, Boost, Chase, Heal)
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={!actionName.trim() || isProcessing}
        >
          {isProcessing ? "Applying..." : "Apply Action"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}