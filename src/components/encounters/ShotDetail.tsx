"use client"

import { useMemo } from "react"
import type { Character, Shot, Vehicle } from "@/types"
import { ListSubheader, Box } from "@mui/material"
import { CharacterDetail, VehicleDetail } from "@/components/encounters"
import { CS, CES } from "@/services"
import { useEncounter } from "@/contexts"

type ShotDetailProps = {
  shot: Shot
}

export default function ShotDetail({ shot }: ShotDetailProps) {
  const { encounter } = useEncounter()
  
  // Sort characters by type, then adjusted speed, then name
  const sortedCharacters = useMemo(() => {
    const typeOrder: Record<string, number> = {
      "Uber-Boss": 1,
      "Boss": 2,
      "PC": 3,
      "Ally": 4,
      "Featured Foe": 5,
      "Mook": 6,
    }
    
    return [...shot.characters].sort((a, b) => {
      // First sort by character type priority
      const typeA = CS.type(a)
      const typeB = CS.type(b)
      const orderA = typeOrder[typeA] || 999
      const orderB = typeOrder[typeB] || 999

      if (orderA !== orderB) {
        return orderA - orderB
      }

      // Then sort by Speed (higher speed first)
      // Get adjusted speed values if encounter is provided
      let speedA = CS.speed(a) || 0
      let speedB = CS.speed(b) || 0
      
      if (encounter) {
        // Get adjusted speed accounting for effects but not impairments
        const [, adjustedSpeedA] = CES.adjustedValue(a, speedA, "Speed", encounter, true)
        const [, adjustedSpeedB] = CES.adjustedValue(b, speedB, "Speed", encounter, true)
        speedA = adjustedSpeedA
        speedB = adjustedSpeedB
      }

      if (speedA !== speedB) {
        return speedB - speedA
      }

      // Finally sort by name alphabetically (ascending)
      const nameA = a.name || ""
      const nameB = b.name || ""

      return nameA.localeCompare(nameB)
    })
  }, [shot.characters, encounter])
  
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
      {sortedCharacters.map((character: Character) => (
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
