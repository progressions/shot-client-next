import type { Character, Shot, Vehicle } from "@/types"
import { ListSubheader, Box } from "@mui/material"
import { AnimatePresence } from "motion/react"
import { CharacterDetail, VehicleDetail } from "@/components/encounters"

type ShotDetailProps = {
  shot: Shot
}

export default function ShotDetail({ shot }: ShotDetailProps) {
  return (
    <Box>
      <AnimatePresence>
        <ListSubheader
          key={`${shot.shot}-header`}
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
      </AnimatePresence>
      <AnimatePresence>
        {shot.characters.map((character: Character) => (
          <CharacterDetail
            key={`${shot.shot}-character-${character.id}`}
            character={character}
          />
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {shot.vehicles.map((vehicle: Vehicle) => (
          <VehicleDetail
            key={`${shot.shot}-vehicle-${vehicle.id}`}
            vehicle={vehicle}
          />
        ))}
      </AnimatePresence>
    </Box>
  )
}
