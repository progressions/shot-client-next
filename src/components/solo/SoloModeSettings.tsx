"use client"

import { useState } from "react"
import {
  Box,
  Stack,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  Alert,
  OutlinedInput,
} from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import Link from "next/link"
import type { Fight, Character } from "@/types"

interface SoloModeSettingsProps {
  fight: Fight
  characters: Character[]
  onUpdate: (updatedFight: Partial<Fight>) => Promise<void>
}

export function SoloModeSettings({
  fight,
  characters,
  onUpdate,
}: SoloModeSettingsProps) {
  const [saving, setSaving] = useState(false)

  const handleSoloModeToggle = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSaving(true)
    try {
      await onUpdate({ solo_mode: event.target.checked })
    } finally {
      setSaving(false)
    }
  }

  const handlePlayerCharactersChange = async (
    event: SelectChangeEvent<string[]>
  ) => {
    const value = event.target.value
    const ids = typeof value === "string" ? value.split(",") : value
    setSaving(true)
    try {
      await onUpdate({ solo_player_character_ids: ids })
    } finally {
      setSaving(false)
    }
  }

  const handleBehaviorTypeChange = async (event: SelectChangeEvent<string>) => {
    setSaving(true)
    try {
      await onUpdate({
        solo_behavior_type: event.target.value as "simple" | "ai",
      })
    } finally {
      setSaving(false)
    }
  }

  // Get character names for display
  const getCharacterName = (id: string) => {
    const char = characters.find(c => c.id === id)
    return char?.name || id
  }

  const selectedPlayerIds = fight.solo_player_character_ids || []
  const behaviorType = fight.solo_behavior_type || "simple"

  return (
    <Box sx={{ mt: 2 }}>
      {/* Solo Mode Toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={fight.solo_mode || false}
            onChange={handleSoloModeToggle}
            disabled={saving}
          />
        }
        label="Enable Solo Play Mode"
      />

      {fight.solo_mode && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Player Character Selection */}
          <FormControl fullWidth size="small">
            <InputLabel id="player-characters-label">
              Player Characters
            </InputLabel>
            <Select
              labelId="player-characters-label"
              multiple
              value={selectedPlayerIds}
              onChange={handlePlayerCharactersChange}
              disabled={saving || characters.length === 0}
              input={<OutlinedInput label="Player Characters" />}
              renderValue={selected => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map(id => (
                    <Chip
                      key={id}
                      label={getCharacterName(id)}
                      size="small"
                      color="primary"
                    />
                  ))}
                </Box>
              )}
            >
              {characters.length === 0 ? (
                <MenuItem disabled>
                  <em>Add characters to the fight first</em>
                </MenuItem>
              ) : (
                characters.map(character => (
                  <MenuItem key={character.id} value={character.id}>
                    {character.name}
                  </MenuItem>
                ))
              )}
            </Select>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Select which characters are controlled by the player. All others
              will be NPCs.
            </Typography>
          </FormControl>

          {/* Behavior Type Selection */}
          <FormControl fullWidth size="small">
            <InputLabel id="behavior-type-label">NPC Behavior</InputLabel>
            <Select
              labelId="behavior-type-label"
              value={behaviorType}
              onChange={handleBehaviorTypeChange}
              disabled={saving}
              label="NPC Behavior"
            >
              <MenuItem value="simple">
                Simple - NPCs attack highest-shot PC
              </MenuItem>
              <MenuItem value="ai">
                AI-Powered - NPCs use tactical AI decisions
              </MenuItem>
            </Select>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Simple mode is instant. AI mode generates narrative descriptions.
            </Typography>
          </FormControl>

          {/* Validation Warning */}
          {selectedPlayerIds.length === 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Select at least one player character to use solo play mode.
            </Alert>
          )}

          {/* Launch Button */}
          {selectedPlayerIds.length > 0 && (
            <Button
              component={Link}
              href={`/solo/${fight.id}`}
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              sx={{ mt: 1 }}
            >
              Launch Solo Encounter
            </Button>
          )}
        </Stack>
      )}
    </Box>
  )
}
