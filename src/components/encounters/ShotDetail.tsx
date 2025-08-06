"use client"

import type { Character, Shot, Vehicle } from "@/types"
import { ListSubheader, Box } from "@mui/material"
import { AnimatePresence, motion } from "motion/react"
import { CharacterDetail, VehicleDetail } from "@/components/encounters"

type ShotDetailProps = {
  shot: Shot
}

export default function ShotDetail({ shot }: ShotDetailProps) {
  return (
    <AnimatePresence>
      <motion.div
        key={`shot-${shot.shot}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Box>
          <ListSubheader
            sx={{
              position: "sticky",
              top: "52px",
              textAlign: "right",
              fontSize: "1.5rem",
              fontWeight: "bold",
              width: "100%",
              borderRadius: "1px 1px 8px 8px",
              zIndex: 1099, // Below AppBar (zIndex: 1100)
              backgroundColor: "background.paper", // Ensure visibility
            }}
          >
            {shot.shot}
          </ListSubheader>
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
      </motion.div>
    </AnimatePresence>
  )
}
