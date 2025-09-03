"use client"

import { useState, useMemo, useEffect } from "react"
import { List } from "@mui/material"
import { MenuBar, ShotDetail } from "@/components/encounters"
import { useEncounter } from "@/contexts"
import { useLocalStorage } from "@/contexts/LocalStorageContext"

export default function ShotCounter() {
  const { encounter } = useEncounter()
  const { getLocally, saveLocally } = useLocalStorage()
  const [showHidden, setShowHidden] = useState(false)

  // Load the persisted setting on mount
  useEffect(() => {
    const savedShowHidden = getLocally(`fight_${encounter.id}_showHidden`)
    if (savedShowHidden !== null) {
      setShowHidden(savedShowHidden as boolean)
    }
  }, [encounter.id, getLocally])

  // Handle changes to the showHidden setting
  const handleShowHiddenChange = (value: boolean) => {
    setShowHidden(value)
    saveLocally(`fight_${encounter.id}_showHidden`, value)
  }

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
      <MenuBar
        showHidden={showHidden}
        onShowHiddenChange={handleShowHiddenChange}
      />
      <List>
        {visibleShots.map((shot, index) => (
          <ShotDetail key={`${shot.shot}-${index}`} shot={shot} />
        ))}
      </List>
    </>
  )
}
