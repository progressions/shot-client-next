"use client"
import { useState } from "react"
import type { Entity, Character } from "@/types"
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material"
import { useEncounter, useToast } from "@/contexts"
import { Icon } from "@/components/ui"
import { CS } from "@/services"

type ActionsProps = {
  entity: Entity
}

export default function Actions({ entity }: ActionsProps) {
  const { ec } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [shotCost, setShotCost] = useState(3)

  const getDefaultShotCost = () => {
    // Check if entity is a character and if it's a boss/uber-boss
    const character = entity as Character
    if (CS.isBoss(character) || CS.isUberBoss(character)) {
      return 2
    }
    return 3
  }

  const handleOpen = () => {
    setDialogOpen(true)
    setShotCost(getDefaultShotCost()) // Set default based on character type
  }

  const handleClose = () => {
    setDialogOpen(false)
  }

  const handleSpendShots = async () => {
    try {
      await ec.spendShots(entity, shotCost)
      toastSuccess(
        `${entity.name} spent ${shotCost} ${shotCost === 1 ? "shot" : "shots"}`
      )
      handleClose()
    } catch (error) {
      console.error("Error spending shots:", error)
      toastError(`Failed to spend shots for ${entity.name}`)
    }
  }

  const handleShotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0
    setShotCost(Math.max(0, Math.min(20, value))) // Clamp between 0 and 20
  }

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ p: 1 }}>
        <Icon keyword="Actions" size={24} />
      </IconButton>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Spend Shots</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              How many shots does {entity.name} spend?
            </Typography>
            <TextField
              autoFocus
              type="number"
              label="Shot Cost"
              value={shotCost}
              onChange={handleShotChange}
              sx={{ width: 120 }}
              inputProps={{
                min: 0,
                max: 20,
                step: 1,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSpendShots}
            variant="contained"
            disabled={shotCost < 0 || shotCost > 20}
          >
            Spend {shotCost} {shotCost === 1 ? "Shot" : "Shots"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
