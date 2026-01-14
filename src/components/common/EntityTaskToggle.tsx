"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Switch, FormControlLabel, CircularProgress, Box } from "@mui/material"
import { useToast } from "@/contexts"
import type { Entity } from "@/types"

interface EntityTaskToggleProps {
  entity: Entity
  handleChangeAndSave?: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>
  onChange?: (checked: boolean) => void
}

export function EntityTaskToggle({
  entity,
  handleChangeAndSave,
  onChange,
}: EntityTaskToggleProps) {
  const { toastSuccess, toastError } = useToast()
  // @ts-expect-error - task exists on Person and Vehicle which make up Entity
  const [isTask, setIsTask] = useState(entity.task ?? false)
  const [loading, setLoading] = useState(false)

  // Sync local state when entity prop changes (e.g. after a save or subscription update)
  useEffect(() => {
    // @ts-expect-error - task exists on Person and Vehicle
    setIsTask(entity.task ?? false)
  }, [entity.task])

  const handleToggle = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked

      if (onChange) {
        setIsTask(newValue)
        onChange(newValue)
        return
      }

      if (!handleChangeAndSave) return

      // Optimistic update
      setIsTask(newValue)
      setLoading(true)

      try {
        // Create synthetic event with task field
        const syntheticEvent = {
          ...event,
          target: {
            ...event.target,
            name: "task",
            checked: newValue,
            type: "checkbox",
          },
        } as React.ChangeEvent<HTMLInputElement>

        await handleChangeAndSave(syntheticEvent)
        toastSuccess("Task status updated")
      } catch (error) {
        // Revert on error
        setIsTask(!newValue)
        toastError("Failed to update task status")
        console.error("Error updating task status:", error)
      } finally {
        setLoading(false)
      }
    },
    [handleChangeAndSave, onChange, toastSuccess, toastError]
  )

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      <FormControlLabel
        control={
          <Switch
            checked={isTask}
            onChange={handleToggle}
            disabled={loading}
            name="task"
            inputProps={{
              "aria-label": "Toggle task status",
              role: "checkbox",
            }}
          />
        }
        label="Task"
        labelPlacement="end"
      />
      {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
    </Box>
  )
}

export default EntityTaskToggle
