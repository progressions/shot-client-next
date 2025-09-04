"use client"

import { useState, useMemo, useEffect } from "react"
import { List, Box } from "@mui/material"
import { 
  MenuBar, 
  ShotDetail, 
  CharacterSelector, 
  EncounterActionBar,
  AttackPanel,
  BoostPanel,
  ChasePanel,
  HealDialog 
} from "@/components/encounters"
import { useEncounter } from "@/contexts"
import { useLocalStorage } from "@/contexts/LocalStorageContext"
import { getAllVisibleShots } from "@/components/encounters/attacks/shotSorting"

export default function ShotCounter() {
  const { encounter, selectedActorId, setSelectedActor } = useEncounter()
  const { getLocally, saveLocally } = useLocalStorage()
  const [showHidden, setShowHidden] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)

  // Load the persisted setting on mount
  useEffect(() => {
    if (!encounter?.id) return

    const savedShowHidden = getLocally(`fight_${encounter.id}_showHidden`)
    if (savedShowHidden !== null) {
      setShowHidden(savedShowHidden as boolean)
    }
  }, [encounter?.id, getLocally])

  // Handle changes to the showHidden setting
  const handleShowHiddenChange = (value: boolean) => {
    setShowHidden(value)
    if (encounter?.id) {
      saveLocally(`fight_${encounter.id}_showHidden`, value)
    }
  }

  // Filter shots based on showHidden state
  const visibleShots = useMemo(() => {
    if (!encounter?.shots) {
      return []
    }

    if (showHidden) {
      // Show all shots including hidden ones
      return encounter.shots
    } else {
      // Filter out shots where shot value is null (hidden)
      return encounter.shots.filter(shot => shot.shot !== null)
    }
  }, [encounter?.shots, showHidden])

  // Get all visible shots as individual Shot objects for CharacterSelector
  const allVisibleShots = useMemo(() => {
    if (!encounter?.shots) {
      return []
    }
    return getAllVisibleShots(encounter.shots)
  }, [encounter?.shots])

  // Handle character selection
  const handleCharacterSelect = (shotId: string) => {
    if (shotId === selectedActorId) {
      // Deselect if clicking the same character
      setSelectedActor(null, null)
      setActivePanel(null)
    } else {
      // Find the shot number for this character
      const selectedShot = allVisibleShots.find(
        s => s.character?.shot_id === shotId
      )
      if (selectedShot) {
        setSelectedActor(shotId, selectedShot.shot)
        setActivePanel(null) // Reset panel when selecting new character
      }
    }
  }

  // Get the selected character object
  const selectedCharacter = useMemo(() => {
    if (!selectedActorId) return null
    const shot = allVisibleShots.find(s => s.character?.shot_id === selectedActorId)
    return shot?.character || null
  }, [selectedActorId, allVisibleShots])

  // Handle action from EncounterActionBar
  const handleAction = (action: string) => {
    setActivePanel(action)
  }

  const handlePanelClose = () => {
    setActivePanel(null)
  }

  return (
    <>
      {/* Character selector at the top */}
      <Box sx={{ mb: 2, mt: 1 }}>
        <CharacterSelector
          shots={allVisibleShots}
          selectedShotId={selectedActorId}
          onSelect={handleCharacterSelect}
        />
      </Box>
      
      {/* Action bar appears when character is selected */}
      <EncounterActionBar
        selectedCharacter={selectedCharacter}
        onAction={handleAction}
      />
      
      <MenuBar
        showHidden={showHidden}
        onShowHiddenChange={handleShowHiddenChange}
      />
      <List>
        {visibleShots.map((shot, index) => (
          <ShotDetail key={`${shot.shot}-${index}`} shot={shot} />
        ))}
      </List>

      {/* Action Panels */}
      {activePanel === "attack" && selectedCharacter && (
        <AttackPanel
          preselectedAttacker={selectedCharacter}
          onClose={handlePanelClose}
        />
      )}
      
      {activePanel === "boost" && selectedCharacter && (
        <BoostPanel
          preselectedBooster={selectedCharacter}
          onClose={handlePanelClose}
        />
      )}
      
      {activePanel === "chase" && selectedCharacter && (
        <ChasePanel
          preselectedCharacter={selectedCharacter}
          onClose={handlePanelClose}
        />
      )}
      
      {activePanel === "heal" && selectedCharacter && (
        <HealDialog
          open={true}
          onClose={handlePanelClose}
          character={selectedCharacter}
        />
      )}
    </>
  )
}
