"use client"

import type { Character, Shot, Vehicle } from "@/types"
import { ListSubheader, Box } from "@mui/material"
import { CharacterDetail, VehicleDetail } from "@/components/encounters"

type ShotDetailProps = {
  shot: Shot
}

export default function ShotDetail({ shot }: ShotDetailProps) {
  return (
    <Box>
      <ListSubheader
        sx={{
          position: "sticky",
          top: "56px",
          textAlign: "right",
          fontSize: "1.5rem",
          fontWeight: "bold",
          width: "100%",
          borderRadius: "1px 1px 8px 8px",
          zIndex: 1099, // Below AppBar (zIndex: 1100)
          backgroundColor: "background.paper", // Ensure visibility
        }}
      >
        {shot.shot === null ? "Hidden" : `${shot.shot || "0"}`}
      </ListSubheader>
      {shot.characters.map((character: Character) => (
        <CharacterDetail
          key={`fred-${shot.shot}-character-${character.shot_id}`}
          character={character}
        />
      ))}
      {shot.vehicles.map((vehicle: Vehicle) => (
        <VehicleDetail
          key={`${shot.shot}-vehicle-${vehicle.id}`}
          vehicle={vehicle}
        />
      ))}
    </Box>
  )
}
