"use client"
import type { Entity } from "@/types"
import { Box, Stack, Grid } from "@mui/material"
import { VS } from "@/services"
import { ActionValueEdit as ActionValue } from "@/components/characters"
type ActionValuesEditProps = {
  entity: Entity
  size: "small" | "large"
  setEntity: (entity: Entity) => void
  updateEntity: (updatedEntity: Entity) => Promise<void>
}
export default function ActionValuesEdit({
  entity,
  size,
  setEntity,
  updateEntity,
}: ActionValuesEditProps) {
  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={6} sm={4} md={2.4}>
          <ActionValue
            name="Acceleration"
            value={VS.acceleration(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <ActionValue
            name="Handling"
            value={VS.handling(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <ActionValue
            name="Squeal"
            value={VS.squeal(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <ActionValue
            name="Frame"
            value={VS.frame(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <ActionValue
            name="Crunch"
            value={VS.crunch(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
