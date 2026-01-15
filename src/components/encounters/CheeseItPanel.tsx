"use client"

import React, { useState, useEffect } from "react"
import { Box, Button, Alert, Typography } from "@mui/material"
import { useEncounter, useToast, useClient } from "@/contexts"
import { Avatar } from "@/components/avatars"
import { NumberField, Icon } from "@/components/ui"
import BasePanel from "./BasePanel"
import type { Character } from "@/types"

interface CheeseItPanelProps {
  preselectedCharacter: Character
  onComplete?: () => void
}

export default function CheeseItPanel({
  preselectedCharacter,
  onComplete,
}: CheeseItPanelProps) {
  const { encounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()
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
      const characterShot = allShots.find((shotGroup: Shot) =>
        shotGroup.characters?.some(
          (c: Character) => c.id === preselectedCharacter.id
        )
      )
      const currentShot = characterShot?.shot || 0

      // Use the user-specified shot cost
      const actualShotCost = parseInt(shotCost) || defaultShotCost

      // Calculate new shot position
      const newShot = Math.max(0, currentShot - actualShotCost)

      // Prepare character update - use shot_id for more reliable updates
      const characterUpdate = {
        shot_id: preselectedCharacter.shot_id,
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

      // Apply the update using client.applyCombatAction
      await client.applyCombatAction(encounter, [characterUpdate])

      toastSuccess(`${preselectedCharacter.name} is cheesing it!`)
      if (onComplete) onComplete()
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

  return (
    <BasePanel
      title="Cheese It"
      icon={<Icon keyword="Cheese It" />}
      borderColor="warning.main"
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            character={preselectedCharacter}
            hideVehicle
            size={64}
            showImpairments
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, mb: 2 }}>
          {/* Shot Cost Input */}
          <Box>
            <NumberField
              name="shotCost"
              label="Shots"
              value={parseInt(shotCost) || 0}
              onChange={e => setShotCost(e.target.value)}
              onBlur={e => setShotCost(e.target.value)}
              size="small"
              error={false}
              labelBackgroundColor="#202020"
            />
          </Box>

          {/* Alerts */}
          <Box sx={{ flex: 1 }}>
            {isAlreadyCheesing ? (
              <Alert severity="warning">
                {preselectedCharacter.name} is already attempting to escape!
              </Alert>
            ) : hasEscaped ? (
              <Alert severity="success">
                {preselectedCharacter.name} has successfully escaped!
              </Alert>
            ) : (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Cheese It:</strong> Spend shots to attempt escape.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Characters acting after you can attempt to prevent your escape
                  with a Speed check.
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>

        {!isAlreadyCheesing && !hasEscaped && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="warning"
              onClick={handleCheeseIt}
              disabled={submitting || !shotCost || parseInt(shotCost) <= 0}
              startIcon={<Icon keyword="Cheese It" />}
            >
              {submitting ? "Running..." : "Cheese It!"}
            </Button>
          </Box>
        )}
      </Box>
    </BasePanel>
  )
}
