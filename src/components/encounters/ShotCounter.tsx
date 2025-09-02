"use client"

import { useState, useMemo } from "react"
import { List } from "@mui/material"
import { MenuBar, ShotDetail } from "@/components/encounters"
import { useEncounter } from "@/contexts"

export default function ShotCounter() {
  const { encounter } = useEncounter()
  const [showHidden, setShowHidden] = useState(false)

  // Filter shots based on showHidden state
  const visibleShots = useMemo(() => {
    if (showHidden) {
      // Show all shots including hidden ones
      return encounter.shots
    } else {
      // Filter out shots where shot value is null (hidden)
      return encounter.shots.filter(shot => shot.shot !== null)
    }
  }, [encounter.shots, showHidden])

  return (
    <>
      <MenuBar showHidden={showHidden} onShowHiddenChange={setShowHidden} />
      <List>
        {visibleShots.map((shot, index) => (
          <ShotDetail key={`${shot.shot}-${index}`} shot={shot} />
        ))}
      </List>
    </>
  )
}
