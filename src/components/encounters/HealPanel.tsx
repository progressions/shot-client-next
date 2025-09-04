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
import { useEncounter, useToast, useClient } from "@/contexts"
import { CS } from "@/services"
import type { Character } from "@/types"

interface HealPanelProps {
  onClose?: () => void
  preselectedCharacter?: Character
}

export default function HealPanel({ onClose, preselectedCharacter }: HealPanelProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()

  // Form state
  const [healAmount, setHealAmount] = useState("5")
  const [healNotes, setHealNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Delay rendering for animation
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleApplyHeal = async () => {
    if (!preselectedCharacter) {
      toastError("No character selected")
      return
    }

    const amount = parseInt(healAmount, 10)
    if (isNaN(amount) || amount < 1 || amount > 35) {
      toastError("Heal amount must be between 1 and 35")
      return
    }

    setIsProcessing(true)

    try {
      // For now, simulate healing with a success message
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const currentWounds = preselectedCharacter.wounds || 0
      const healedAmount = Math.min(amount, currentWounds)
      
      toastSuccess(
        `${preselectedCharacter.name} healed ${healedAmount} wound${healedAmount !== 1 ? "s" : ""}`
      )

      // Reset form and close panel
      setHealAmount("5")
      setHealNotes("")
      if (onClose) onClose()
    } catch (error) {
      console.error("Failed to apply healing:", error)
      toastError("Failed to apply healing")
    } finally {
      setIsProcessing(false)
    }
  }

  const currentWounds = preselectedCharacter?.wounds || 0
  const maxWounds = 35 // Typical max wounds for characters

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
        Heal Wounds
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
              <Typography variant="h6" sx={{ mb: 2, color: "success.main" }}>
                💚 Healing Target
              </Typography>
              
              {preselectedCharacter ? (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {preselectedCharacter.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Type: {CS.type(preselectedCharacter)}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Current Wounds: <strong>{currentWounds}</strong>
                  </Typography>
                  {currentWounds > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Impairment: -{Math.floor(currentWounds / 5)}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No character selected
                </Typography>
              )}
            </Box>
          </Box>

          {/* Healing Resolution Section */}
          <Box
            sx={{ p: { xs: 2, sm: 3 }, backgroundColor: "background.default" }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}
            >
              💊 Healing Resolution
            </Typography>

            {preselectedCharacter && currentWounds > 0 ? (
              <>
                {/* Heal Amount Selection */}
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Wounds to Heal</InputLabel>
                    <Select
                      value={healAmount}
                      onChange={(e) => setHealAmount(e.target.value)}
                      label="Wounds to Heal"
                      disabled={isProcessing}
                    >
                      <MenuItem value="1">1 wound</MenuItem>
                      <MenuItem value="2">2 wounds</MenuItem>
                      <MenuItem value="3">3 wounds</MenuItem>
                      <MenuItem value="4">4 wounds</MenuItem>
                      <MenuItem value="5">5 wounds (typical)</MenuItem>
                      <MenuItem value="10">10 wounds (major healing)</MenuItem>
                      <MenuItem value={currentWounds.toString()}>
                        All wounds ({currentWounds})
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Notes Field */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    label="Healing Notes (optional)"
                    value={healNotes}
                    onChange={(e) => setHealNotes(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="e.g., Medical kit, Healing schtick, Natural recovery..."
                    disabled={isProcessing}
                  />
                </Box>

                {/* Healing Summary */}
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Healing <strong>{preselectedCharacter.name}</strong> for{" "}
                    <strong>{Math.min(parseInt(healAmount, 10), currentWounds)}</strong> wound
                    {Math.min(parseInt(healAmount, 10), currentWounds) !== 1 ? "s" : ""}
                    {parseInt(healAmount, 10) > currentWounds && (
                      <> (limited by current wounds)</>
                    )}
                  </Typography>
                </Alert>
              </>
            ) : preselectedCharacter && currentWounds === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {preselectedCharacter.name} has no wounds to heal
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a wounded character to apply healing
                </Typography>
              </Box>
            )}

            {/* Action Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleApplyHeal}
                disabled={!preselectedCharacter || currentWounds === 0 || isProcessing}
                startIcon={
                  isProcessing && <CircularProgress size={20} />
                }
                color="success"
              >
                {isProcessing ? "APPLYING..." : "✓ APPLY HEALING"}
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