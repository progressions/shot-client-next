"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from "@mui/material"
import { FaPersonRunning } from "react-icons/fa6"
import { useEncounter } from "@/contexts"
import { useToast } from "@/contexts"
import { CS } from "@/services"
import { CharacterLink } from "@/components/ui/links"
import { Avatar } from "@/components/avatars"
import { NumberField } from "@/components/ui"
import type { Character } from "@/types"

interface CheeseItPanelProps {
  preselectedCharacter: Character
  onClose?: () => void
  onComplete?: () => void
}

export default function CheeseItPanel({
  preselectedCharacter,
  onClose,
  onComplete,
}: CheeseItPanelProps) {
  const { encounter, applyCharacterUpdates } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const [submitting, setSubmitting] = useState(false)
  
  // Calculate default shot cost based on character type
  const characterType = preselectedCharacter.action_values?.["Type"]
  const isBoss = characterType === "Boss" || characterType === "Uber-Boss"
  const defaultShotCost = isBoss ? 2 : 3
  
  const [shotCost, setShotCost] = useState(defaultShotCost.toString())
  
  // Reset shot cost when character changes
  useEffect(() => {
    const newDefault = isBoss ? 2 : 3
    setShotCost(newDefault.toString())
  }, [preselectedCharacter?.id, isBoss])

  const handleCheeseIt = async () => {
    if (!preselectedCharacter || !encounter) return

    setSubmitting(true)
    try {
      // Get the current shot from encounter shots
      const allShots = encounter.shots || []
      const characterShot = allShots.find((shotGroup: any) =>
        shotGroup.characters?.some(
          (c: Character) => c.id === preselectedCharacter.id
        )
      )
      const currentShot = characterShot?.shot || 0

      // Use the user-specified shot cost
      const actualShotCost = parseInt(shotCost) || defaultShotCost

      // Calculate new shot position
      const newShot = Math.max(0, currentShot - actualShotCost)

      // Prepare character update
      const characterUpdate = {
        character_id: preselectedCharacter.id,
        shot: newShot,
        add_status: ["cheesing_it"],
        event: {
          type: "escape_attempt",
          description: `${preselectedCharacter.name} is attempting to cheese it!`,
          details: {
            character_id: preselectedCharacter.id,
            shot_cost: actualShotCost,
            old_shot: currentShot,
            new_shot: newShot,
          },
        },
      }

      // Apply the update
      await applyCharacterUpdates([characterUpdate])

      toastSuccess(`${preselectedCharacter.name} is cheesing it!`)
      onComplete()
    } catch (error) {
      console.error("Failed to cheese it:", error)
      toastError("Failed to cheese it")
    } finally {
      setSubmitting(false)
    }
  }

  // Check if character is already attempting escape
  const isAlreadyCheesing = preselectedCharacter.status?.includes("cheesing_it")
  const hasEscaped = preselectedCharacter.status?.includes("cheesed_it")

  // Get the current shot from encounter shots
  const allShots = encounter?.shots || []
  const characterShot = allShots.find((shotGroup: any) =>
    shotGroup.characters?.some(
      (c: Character) => c.id === preselectedCharacter.id
    )
  )
  const currentShot = characterShot?.shot || 0

  return (
    <Paper
      sx={{
        p: 3,
        mb: 2,
        position: "relative",
        border: "2px solid",
        borderColor: "warning.main",
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FaPersonRunning size={24} />
        <Typography variant="h6" component="h2">
          Cheese It
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar character={preselectedCharacter} hideVehicle size={64} />
        </Box>
        
        {/* Shot Cost Input */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Shot Cost
          </Typography>
          <NumberField
            name="shotCost"
            value={parseInt(shotCost) || 0}
            onChange={(e) => setShotCost(e.target.value)}
            onBlur={(e) => setShotCost(e.target.value)}
            size="small"
            error={false}
          />
        </Box>

        {isAlreadyCheesing && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {preselectedCharacter.name} is already attempting to escape!
          </Alert>
        )}

        {hasEscaped && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {preselectedCharacter.name} has successfully escaped!
          </Alert>
        )}

        {!isAlreadyCheesing && !hasEscaped && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Cheese It:</strong> Spend shots to attempt escape.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Characters acting after you can attempt to prevent your escape
                with a Speed check.
              </Typography>
            </Alert>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="warning"
                onClick={handleCheeseIt}
                disabled={submitting || !shotCost || parseInt(shotCost) <= 0}
                startIcon={<FaPersonRunning />}
              >
                {submitting ? "Running..." : "Cheese It!"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  )
}
