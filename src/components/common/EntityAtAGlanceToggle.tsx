"use client"

import React, { useState, useCallback } from "react"
import { Switch, FormControlLabel, CircularProgress, Box } from "@mui/material"
import { useClient, useCampaign, useToast } from "@/contexts"

interface EntityAtAGlanceToggleProps {
  entity: {
    id: string
    entity_class: string
    at_a_glance?: boolean
  }
  handleChangeAndSave: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>
}

export function EntityAtAGlanceToggle({
  entity,
  handleChangeAndSave,
}: EntityAtAGlanceToggleProps) {
  const { user } = useClient()
  const { campaign } = useCampaign()
  const { toastSuccess, toastError } = useToast()

  const [atAGlance, setAtAGlance] = useState(entity.at_a_glance ?? false)
  const [loading, setLoading] = useState(false)

  const handleToggle = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked

      setAtAGlance(newValue)
      setLoading(true)

      try {
        const syntheticEvent = {
          ...event,
          target: {
            ...event.target,
            name: "at_a_glance",
            checked: newValue,
            type: "checkbox",
          },
        } as React.ChangeEvent<HTMLInputElement>

        await handleChangeAndSave(syntheticEvent)
        toastSuccess(`${entity.entity_class} updated successfully`)
      } catch (error) {
        setAtAGlance(!newValue)
        toastError(`Failed to update ${entity.entity_class}`)
        console.error("Error updating entity at-a-glance status:", error)
      } finally {
        setLoading(false)
      }
    },
    [entity.entity_class, handleChangeAndSave, toastSuccess, toastError]
  )

  const hasPermission =
    user?.admin || (campaign && user?.id === campaign.gamemaster_id)

  if (!hasPermission) {
    return null
  }

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      <FormControlLabel
        control={
          <Switch
            checked={atAGlance}
            onChange={handleToggle}
            disabled={loading}
            name="at_a_glance"
            inputProps={{
              "aria-label": `Toggle ${entity.entity_class} at a glance`,
              role: "checkbox",
            }}
          />
        }
        label="At a Glance"
        labelPlacement="end"
      />
      {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
    </Box>
  )
}

export default EntityAtAGlanceToggle
