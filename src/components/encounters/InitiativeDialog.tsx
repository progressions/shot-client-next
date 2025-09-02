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
import SharedService from "@/services/SharedService"
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

  // Initialize character initiatives when dialog opens
  useEffect(() => {
    if (open && characters.length > 0) {
      const initiatives = characters.map(char => ({
        character: char,
        initiative: null,
        rolled: false,
      }))
      setCharacterInitiatives(initiatives)
    }
  }, [open, characters])

  // Separate PCs from NPCs
  const pcs = characterInitiatives.filter(ci =>
    SharedService.isType(ci.character, ["PC", "Ally"])
  )
  const npcs = characterInitiatives.filter(
    ci => !SharedService.isType(ci.character, ["PC", "Ally"])
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
    const speed = CharacterService.speed(character)
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
        if (!SharedService.isType(ci.character, ["PC", "Ally"])) {
          const dieResult = Dice.rollDie()
          const speed = CharacterService.speed(ci.character)
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
        return SharedService.setInitiative(ci.character, ci.initiative)
      }
      return ci.character
    })
    onApply(updatedCharacters)
    onClose()
  }

  // Check if we can apply (all characters have initiatives)
  const canApply = characterInitiatives.every(ci => ci.initiative !== null)

  const renderCharacterRow = (ci: CharacterInitiative) => {
    const speed = CharacterService.speed(ci.character)
    const isPC = SharedService.isType(ci.character, ["PC", "Ally"])

    return (
      <Box
        key={ci.character.id}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 1,
          px: 1,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Typography sx={{ flex: 1, minWidth: 120 }}>
          {ci.character.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ width: 60 }}>
          Speed: {speed}
        </Typography>
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
          Set initiative values for all characters. PCs typically roll or enter
          manually, NPCs can be auto-rolled.
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
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={!canApply}
        >
          Apply & Start Sequence
        </Button>
      </DialogActions>
    </Dialog>
  )
}