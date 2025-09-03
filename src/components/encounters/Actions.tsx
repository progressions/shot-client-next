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
  Box,
  Typography,
} from "@mui/material"
import { useEncounter, useToast } from "@/contexts"
import { Icon, NumberField } from "@/components/ui"
import { CS } from "@/services"

type ActionsProps = {
  entity: Entity
}

export default function Actions({ entity }: ActionsProps) {
  const { ec, encounter } = useEncounter()
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

  // Get current shot for the entity
  const getCurrentShot = () => {
    if (!encounter?.shots) return null
    
    for (const shot of encounter.shots) {
      const character = shot.characters?.find(c => c.id === entity.id)
      if (character && character.current_shot !== undefined) {
        return character.current_shot
      }
      const vehicle = shot.vehicles?.find(v => v.id === entity.id)
      if (vehicle && vehicle.current_shot !== undefined) {
        return vehicle.current_shot
      }
    }
    return null
  }

  const currentShot = getCurrentShot()
  const newShot = currentShot !== null ? currentShot - shotCost : null

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ p: 1 }}>
        <Icon keyword="Actions" size={24} />
      </IconButton>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth={false} sx={{ "& .MuiDialog-paper": { width: 280 } }}>
        <DialogTitle>Spend Shots</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {currentShot !== null && shotCost > 0 && (
              <Typography variant="body2" sx={{ mb: 1.5, textAlign: "center" }}>
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {entity.name}
                </Box>
                <Box sx={{ mt: 0.5 }}>
                  Shot&nbsp;{currentShot} → Shot&nbsp;{newShot}
                </Box>
              </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <NumberField
                name="shotCost"
                value={shotCost}
                size="small"
                width="80px"
                error={false}
                onChange={handleShotChange}
                onBlur={() => {}}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSpendShots}
            variant="contained"
            disabled={shotCost < 0 || shotCost > 20}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
