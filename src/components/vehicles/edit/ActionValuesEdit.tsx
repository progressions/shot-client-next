"use client"
import type { Entity } from "@/types"
import { Box, Stack } from "@mui/material"
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
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <ActionValue
            name="Acceleration"
            value={VS.acceleration(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
          <ActionValue
            name="Handling"
            value={VS.handling(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
          <ActionValue
            name="Squeal"
            value={VS.squeal(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="center">
          <ActionValue
            name="Frame"
            value={VS.frame(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
          <ActionValue
            name="Crunch"
            value={VS.crunch(entity)}
            size={size}
            character={entity}
            setCharacter={setEntity}
            updateCharacter={updateEntity}
          />
        </Stack>
      </Stack>
    </Box>
  )
}
