"use client"

import { useState } from "react"
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material"
import { Icon } from "@/components/ui"
import { type Entity } from "@/types"
import { AddVehicle, AddCharacter } from "@/components/encounters"

export default function MenuBar() {
  const [addCharacterOpen, setAddCharacterOpen] = useState(false)
  const [addVehicleOpen, setAddVehicleOpen] = useState(false)
  const [entity, setEntity] = useState<Entity | null>(null)

  return (
    <>
      <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Menu
          </Typography>
          <IconButton color="inherit" onClick={() => setAddVehicleOpen(true)}>
            <Icon keyword="Add Vehicle" color="white" />
          </IconButton>
          <IconButton color="inherit" onClick={() => setAddCharacterOpen(true)}>
            <Icon keyword="Add Character" color="white" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <AddCharacter
        open={addCharacterOpen}
        onClose={() => setAddCharacterOpen(false)}
      />
      <AddVehicle
        open={addVehicleOpen}
        onClose={() => setAddVehicleOpen(false)}
      />
    </>
  )
}
