import { motion } from "motion/react"
import type { Character, Vehicle } from "@/types"
import { ListSubheader, Box } from "@mui/material"
import {
  CharacterDetail,
  VehicleDetail,
  Character,
  Vehicle,
} from "@/components/encounters"
import { transition } from "@/components/encounters/Encounter"

type ShotDetailProps = {
  shot: Shot
}

export default function ShotDetail({ shot }: ShotDetailProps) {
  return (
    <Box>
      <motion.div
        key={`shot-${shot.shot}`}
        layout
        layoutId={`shot-${shot.shot}`}
        transition={transition}
        >
      <ListSubheader
        sx={{
          textAlign: "right",
          fontSize: "1.5rem",
          fontWeight: "bold",
          width: "100%",
          borderRadius: "8px 8px 1px 1px",
        }}
      >
        {shot.shot}
      </ListSubheader>
    </motion.div>
      {shot.characters.map((character: Character) => (
        <CharacterDetail
          key={`${shot.shot}-character-${character.id}`}
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
