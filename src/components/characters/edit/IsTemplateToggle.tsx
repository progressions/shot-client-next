"use client"

import React, { useState, useCallback } from "react"
import { Switch, FormControlLabel, CircularProgress, Box } from "@mui/material"
import type { Character } from "@/types"

interface IsTemplateToggleProps {
  character: Character
  handleChangeAndSave: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>
}

export default function IsTemplateToggle({
  character,
  handleChangeAndSave,
}: IsTemplateToggleProps) {
  const [isTemplate, setIsTemplate] = useState(character.is_template ?? false)
  const [loading, setLoading] = useState(false)

  const handleToggle = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked

      // Optimistic update
      setIsTemplate(newValue)
      setLoading(true)

      try {
        // Create synthetic event with is_template field
        const syntheticEvent = {
          ...event,
          target: {
            ...event.target,
            name: "is_template",
            value: newValue,
          },
        } as React.ChangeEvent<HTMLInputElement>

        await handleChangeAndSave(syntheticEvent)
      } catch (error) {
        // Revert on error
        setIsTemplate(!newValue)
        console.error("Error updating character template status:", error)
      } finally {
        setLoading(false)
      }
    },
    [handleChangeAndSave]
  )

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      <FormControlLabel
        control={
          <Switch
            checked={isTemplate}
            onChange={handleToggle}
            disabled={loading}
            name="is_template"
            inputProps={{
              "aria-label": "Toggle character template status",
              role: "checkbox",
            }}
          />
        }
        label="Template"
        labelPlacement="end"
      />
      {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
    </Box>
  )
}
