"use client"

import React, { useState, useCallback } from "react"
import { Switch, FormControlLabel, CircularProgress, Box } from "@mui/material"
import { useClient, useCampaign, useToast } from "@/contexts"

interface EntityActiveToggleProps {
  entityType: string
  entityId: string
  currentActive: boolean
  handleChangeAndSave: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>
}

export function EntityActiveToggle({
  entityType,
  currentActive,
  handleChangeAndSave,
}: EntityActiveToggleProps) {
  const { user } = useClient()
  const { campaign } = useCampaign()
  const { toastSuccess, toastError } = useToast()

  const [isActive, setIsActive] = useState(currentActive)
  const [loading, setLoading] = useState(false)

  const handleToggle = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked

      // Optimistic update
      setIsActive(newValue)
      setLoading(true)

      try {
        // Create synthetic event with active field
        const syntheticEvent = {
          ...event,
          target: {
            ...event.target,
            name: "active",
            value: newValue,
          },
        } as React.ChangeEvent<HTMLInputElement>

        await handleChangeAndSave(syntheticEvent)
        toastSuccess(`${entityType} updated successfully`)
      } catch (error) {
        // Revert on error
        setIsActive(!newValue)
        toastError(`Failed to update ${entityType}`)
        console.error("Error updating entity active status:", error)
      } finally {
        setLoading(false)
      }
    },
    [entityType, handleChangeAndSave, toastSuccess, toastError]
  )

  // Check permissions: admin OR gamemaster of current campaign
  const hasPermission =
    user?.admin || (campaign && user?.id === campaign.gamemaster_id)

  // Don't render if user doesn't have permission
  if (!hasPermission) {
    return null
  }

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      <FormControlLabel
        control={
          <Switch
            checked={isActive}
            onChange={handleToggle}
            disabled={loading}
            name="active"
            inputProps={{
              "aria-label": `Toggle ${entityType} active status`,
              role: "checkbox",
            }}
          />
        }
        label="Active"
        labelPlacement="end"
      />
      {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
    </Box>
  )
}

export default EntityActiveToggle
