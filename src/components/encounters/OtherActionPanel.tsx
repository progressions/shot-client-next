"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material"
import { useEncounter, useToast } from "@/contexts"
import { CS } from "@/services"
import type { Character } from "@/types"

interface OtherActionPanelProps {
  onClose?: () => void
  preselectedCharacter?: Character
}

export default function OtherActionPanel({ onClose, preselectedCharacter }: OtherActionPanelProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()

  // Form state
  const [actionName, setActionName] = useState("")
  const [shotCost, setShotCost] = useState("3")
  const [notes, setNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Delay rendering for animation
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleApplyAction = async () => {
    if (!preselectedCharacter) {
      toastError("No character selected")
      return
    }

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
      // Simulate the action with a success message
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let message = `${preselectedCharacter.name} performed ${actionName}`
      if (cost > 0) {
        message += ` (${cost} shot${cost !== 1 ? "s" : ""})`
      }
      if (notes) {
        message += ` - ${notes}`
      }
      
      toastSuccess(message)

      // Reset form and close panel
      setActionName("")
      setShotCost("3")
      setNotes("")
      if (onClose) onClose()
    } catch (error) {
      console.error("Failed to apply action:", error)
      toastError("Failed to apply action")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box sx={{ overflow: "hidden", minHeight: isReady ? "auto" : "100px" }}>
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        Other Action
      </Typography>

      {isReady ? (
        <>
          {/* Character Info Section */}
          <Box sx={{ backgroundColor: "action.hover" }}>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderBottom: "2px solid",
                borderBottomColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: "info.main" }}>
                ⏱️ Acting Character
              </Typography>
              
              {preselectedCharacter ? (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {preselectedCharacter.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Type: {CS.type(preselectedCharacter)}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No character selected
                </Typography>
              )}
            </Box>
          </Box>

          {/* Action Configuration Section */}
          <Box
            sx={{ p: { xs: 2, sm: 3 }, backgroundColor: "background.default" }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}
            >
              ⚙️ Action Configuration
            </Typography>

            {preselectedCharacter ? (
              <>
                {/* Action Name Field */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    label="Action Name"
                    value={actionName}
                    onChange={(e) => setActionName(e.target.value)}
                    fullWidth
                    autoFocus
                    placeholder="e.g., Reload, Hide, Intimidate, Search, etc."
                    disabled={isProcessing}
                  />
                </Box>

                {/* Shot Cost Selection */}
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Shot Cost</InputLabel>
                    <Select
                      value={shotCost}
                      onChange={(e) => setShotCost(e.target.value)}
                      label="Shot Cost"
                      disabled={isProcessing}
                    >
                      <MenuItem value="0">0 shots (free action)</MenuItem>
                      <MenuItem value="1">1 shot (minor)</MenuItem>
                      <MenuItem value="2">2 shots</MenuItem>
                      <MenuItem value="3">3 shots (standard)</MenuItem>
                      <MenuItem value="4">4 shots</MenuItem>
                      <MenuItem value="5">5 shots</MenuItem>
                      <MenuItem value="6">6 shots (complex)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Notes Field */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    label="Action Details (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Any additional details about the action..."
                    disabled={isProcessing}
                  />
                </Box>

                {/* Action Summary */}
                {actionName && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>{preselectedCharacter.name}</strong> will perform{" "}
                      <strong>{actionName}</strong>
                      {parseInt(shotCost, 10) > 0 && (
                        <> for <strong>{shotCost} shot{parseInt(shotCost, 10) !== 1 ? "s" : ""}</strong></>
                      )}
                      {notes && (
                        <>
                          <br />
                          <em>{notes}</em>
                        </>
                      )}
                    </Typography>
                  </Alert>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                  Use this for any action not covered by the standard action panels
                  (Attack, Boost, Chase, Heal)
                </Typography>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a character to perform a custom action
                </Typography>
              </Box>
            )}

            {/* Action Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleApplyAction}
                disabled={!preselectedCharacter || !actionName.trim() || isProcessing}
                startIcon={
                  isProcessing && <CircularProgress size={20} />
                }
              >
                {isProcessing ? "APPLYING..." : "✓ APPLY ACTION"}
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  )
}