"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  IconButton,
  Divider,
} from "@mui/material"
import { FaDice } from "react-icons/fa"
import { Character, Vehicle } from "@/types"
import CharacterService from "@/services/CharacterService"
import { CS, VS } from "@/services"
import Dice from "@/services/DiceService"

interface InitiativeDialogProps {
  open: boolean
  onClose: () => void
  characters: (Character | Vehicle)[]
  onApply: (updatedCharacters: (Character | Vehicle)[]) => void
}

interface CharacterInitiative {
  character: Character | Vehicle
  initiative: number | null
  rolled: boolean
}

export default function InitiativeDialog({
  open,
  onClose,
  characters,
  onApply,
}: InitiativeDialogProps) {
  const [characterInitiatives, setCharacterInitiatives] = useState<
    CharacterInitiative[]
  >([])

  // Helper function to get speed value - uses vehicle's Acceleration if driving
  const getSpeedValue = (entity: Character | Vehicle): number => {
    // Check if this is a character who is driving
    const charWithDriving = entity as Character & { driving?: Vehicle }
    if (charWithDriving.driving && !CS.isVehicle(entity)) {
      // Use the vehicle's Acceleration value
      return VS.acceleration(charWithDriving.driving)
    }
    // Otherwise use normal Speed
    return CharacterService.speed(entity)
  }

  // Initialize character initiatives when dialog opens
  // Filter out characters with current_shot > 0 and vehicles
  useEffect(() => {
    if (open && characters.length > 0) {
      const eligibleCharacters = characters.filter(char => {
        // Exclude vehicles from initiative
        if (CS.isVehicle(char)) {
          return false
        }

        const charWithShot = char as (Character | Vehicle) & {
          current_shot?: number | string | null
        }
        const currentShot =
          typeof charWithShot.current_shot === "number"
            ? charWithShot.current_shot
            : typeof charWithShot.current_shot === "string"
              ? parseInt(charWithShot.current_shot)
              : null

        // Include if shot is null (hidden), 0, or negative
        return currentShot === null || currentShot <= 0
      })

      const initiatives = eligibleCharacters.map(char => ({
        character: char,
        initiative: null,
        rolled: false,
      }))
      setCharacterInitiatives(initiatives)
    }
  }, [open, characters])

  // Separate PCs from NPCs (vehicles already filtered out)
  const pcs = characterInitiatives.filter(
    ci => !CS.isVehicle(ci.character) && CS.isType(ci.character, ["PC", "Ally"])
  )
  const npcs = characterInitiatives.filter(
    ci =>
      !CS.isVehicle(ci.character) && !CS.isType(ci.character, ["PC", "Ally"])
  )

  // Handle manual initiative entry
  const handleInitiativeChange = (
    character: Character | Vehicle,
    value: string
  ) => {
    const numValue = value === "" ? null : parseInt(value, 10)
    setCharacterInitiatives(prev =>
      prev.map(ci =>
        ci.character.id === character.id
          ? { ...ci, initiative: numValue, rolled: false }
          : ci
      )
    )
  }

  // Roll initiative for a single character
  const rollInitiativeForCharacter = (character: Character | Vehicle) => {
    const dieResult = Dice.rollDie()
    const speed = getSpeedValue(character)
    const initiative = dieResult + speed

    setCharacterInitiatives(prev =>
      prev.map(ci =>
        ci.character.id === character.id
          ? { ...ci, initiative, rolled: true }
          : ci
      )
    )
  }

  // Roll initiative for all NPCs
  const rollAllNPCs = () => {
    setCharacterInitiatives(prev =>
      prev.map(ci => {
        if (!CS.isType(ci.character, ["PC", "Ally"])) {
          const dieResult = Dice.rollDie()
          const speed = getSpeedValue(ci.character)
          const initiative = dieResult + speed
          return { ...ci, initiative, rolled: true }
        }
        return ci
      })
    )
  }

  // Apply initiatives and close dialog
  const handleApply = () => {
    const updatedCharacters = characterInitiatives.map(ci => {
      if (ci.initiative !== null) {
        // Get current shot to apply as modifier
        const charWithShot = ci.character as (Character | Vehicle) & {
          current_shot?: number | string | null
        }
        const currentShot =
          typeof charWithShot.current_shot === "number"
            ? charWithShot.current_shot
            : typeof charWithShot.current_shot === "string"
              ? parseInt(charWithShot.current_shot)
              : null

        // Apply negative shot modifier (if character is at -2, subtract 2 from initiative)
        const finalInitiative =
          currentShot !== null && currentShot < 0
            ? ci.initiative + currentShot // Adding negative number subtracts
            : ci.initiative

        return CS.setInitiative(ci.character, finalInitiative)
      }
      return ci.character
    })
    onApply(updatedCharacters)
    onClose()
  }

  // Check if we can apply (all characters have initiatives)
  const canApply = characterInitiatives.every(ci => ci.initiative !== null)

  const renderCharacterRow = (ci: CharacterInitiative) => {
    const speed = getSpeedValue(ci.character)
    const isPC = CS.isType(ci.character, ["PC", "Ally"])

    // Check if character is driving
    const charWithDriving = ci.character as Character & { driving?: Vehicle }
    const isDriving = charWithDriving.driving && !CS.isVehicle(ci.character)

    // Get current shot for display
    const charWithShot = ci.character as (Character | Vehicle) & {
      current_shot?: number | string | null
    }
    const currentShot =
      typeof charWithShot.current_shot === "number"
        ? charWithShot.current_shot
        : typeof charWithShot.current_shot === "string"
          ? parseInt(charWithShot.current_shot)
          : null

    const hasNegativeShot = currentShot !== null && currentShot < 0
    const shotModifier = hasNegativeShot ? currentShot : 0

    return (
      <Box
        key={ci.character.id}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 1,
          px: 1,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 120 }}>
          <Typography>
            {ci.character.name}
            {hasNegativeShot && (
              <Typography
                component="span"
                variant="body2"
                color="warning.main"
                sx={{ ml: 1 }}
              >
                (Shot {currentShot})
              </Typography>
            )}
          </Typography>
          {isDriving && (
            <Typography variant="body2" color="info.main" sx={{ mt: 0.5 }}>
              {charWithDriving.driving.name}
            </Typography>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ width: 70 }}>
          {isDriving ? "Acc" : "Speed"}: {speed}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            type="number"
            value={ci.initiative ?? ""}
            onChange={e => handleInitiativeChange(ci.character, e.target.value)}
            placeholder={isPC ? "Enter" : "Auto"}
            size="small"
            sx={{ width: 80 }}
            inputProps={{
              min: 0,
              max: 30,
            }}
          />
          {hasNegativeShot && ci.initiative !== null && (
            <Typography variant="body2" color="text.secondary">
              = {ci.initiative + shotModifier}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={() => rollInitiativeForCharacter(ci.character)}
          size="small"
          color={ci.rolled ? "primary" : "default"}
          title={`Roll 1d6 + ${speed}`}
        >
          <FaDice />
        </IconButton>
      </Box>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Set Initiative for Sequence</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Set initiative values for characters at shot 0 or below. Characters
          with negative shots will have their modifier applied (e.g., a
          character at shot -1 entering 9 will start at shot 8).
        </Typography>

        <Grid container spacing={3}>
          {/* PCs Column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">Player Characters</Typography>
              {pcs.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  (None)
                </Typography>
              )}
            </Box>
            <Divider sx={{ mb: 1 }} />
            {pcs.map(ci => renderCharacterRow(ci))}
          </Grid>

          {/* NPCs Column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">NPCs & Enemies</Typography>
              {npcs.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={rollAllNPCs}
                  startIcon={<FaDice />}
                >
                  Roll All NPCs
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 1 }} />
            {npcs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                (None)
              </Typography>
            ) : (
              npcs.map(ci => renderCharacterRow(ci))
            )}
          </Grid>
        </Grid>

        {!canApply && (
          <Typography
            variant="body2"
            color="warning.main"
            sx={{ mt: 2, textAlign: "center" }}
          >
            All characters must have initiative values before starting
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained" disabled={!canApply}>
          Apply & Start Sequence
        </Button>
      </DialogActions>
    </Dialog>
  )
}
