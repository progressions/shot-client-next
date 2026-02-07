"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { List, Box } from "@mui/material"
import {
  MenuBar,
  ShotDetail,
  CharacterSelector,
  EncounterActionBar,
  CharacterDetail,
  AttackPanel,
  BoostPanel,
  ChasePanel,
  HealPanel,
  UpCheckPanel,
  CheeseItPanel,
  SpeedCheckPanel,
} from "@/components/encounters"
import { LocationsPanel } from "@/components/encounters/locations"
import PopOutWindow from "@/components/ui/PopOutWindow"
import { useEncounter } from "@/contexts"
import { useToast } from "@/contexts"
import { useLocalStorage } from "@/contexts/LocalStorageContext"
import { usePopOutWindow } from "@/hooks"
import { getAllVisibleShots } from "@/components/encounters/attacks/shotSorting"

export default function ShotCounter() {
  const { encounter, selectedActorId, setSelectedActor } = useEncounter()
  const { getLocally, saveLocally } = useLocalStorage()
  const { toastError } = useToast()
  const [showHidden, setShowHidden] = useState(true)
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const fightName = encounter?.name || "Fight"
  const { popOut, popIn, isPoppedOut, containerEl } = usePopOutWindow(
    `Locations - ${fightName}`
  )

  // Refs for each panel
  const attackPanelRef = useRef<HTMLDivElement>(null)
  const healPanelRef = useRef<HTMLDivElement>(null)
  const boostPanelRef = useRef<HTMLDivElement>(null)
  const chasePanelRef = useRef<HTMLDivElement>(null)
  const upCheckPanelRef = useRef<HTMLDivElement>(null)
  const cheeseItPanelRef = useRef<HTMLDivElement>(null)
  const speedCheckPanelRef = useRef<HTMLDivElement>(null)
  const locationsPanelRef = useRef<HTMLDivElement>(null)
  const actionBarRef = useRef<HTMLDivElement>(null)

  // Load the persisted setting on mount
  useEffect(() => {
    if (!encounter?.id) return

    const savedShowHidden = getLocally(`fight_${encounter.id}_showHidden`)
    if (savedShowHidden !== null) {
      setShowHidden(savedShowHidden as boolean)
    } else {
      // Default to true if no saved preference exists
      setShowHidden(true)
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
    if (!shotId || shotId === selectedActorId) {
      // Deselect if empty string or clicking the same character
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
    const shot = allVisibleShots.find(
      s => s.character?.shot_id === selectedActorId
    )
    return shot?.character || null
  }, [selectedActorId, allVisibleShots])

  const handlePopOutLocations = () => {
    if (isPoppedOut) {
      popIn()
    } else {
      const result = popOut()
      if (result === null) {
        toastError("Pop-up blocked. Please allow pop-ups for this site.")
        return
      }
      // Close the inline panel if it's open
      if (activePanel === "locations") {
        setActivePanel(null)
      }
    }
  }

  // Handle action from EncounterActionBar
  const handleAction = (action: string) => {
    // If locations are popped out and user clicks locations, focus the window
    if (action === "locations" && isPoppedOut) {
      const result = popOut()
      if (result === null) {
        toastError("Pop-up blocked. Please allow pop-ups for this site.")
        setActivePanel("locations")
      }
      return
    }

    // Toggle panel - if clicking same action, close it
    if (activePanel === action) {
      setActivePanel(null)
    } else {
      setActivePanel(action)

      // Scroll the EncounterActionBar to the top after a brief delay to allow panel to render
      setTimeout(() => {
        if (actionBarRef?.current) {
          // Get the position of the action bar element
          const rect = actionBarRef.current.getBoundingClientRect()
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop

          // Calculate position to bring action bar to top of viewport with 50px buffer for sticky menu
          const targetPosition = rect.top + scrollTop - 50

          // Smooth scroll to the calculated position
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })
        }
      }, 100)
    }
  }

  const handlePanelClose = () => {
    setActivePanel(null)
  }

  const handleActionComplete = () => {
    // Clear selection after completing an action
    setSelectedActor(null, null)
    setActivePanel(null)
  }

  return (
    <>
      {/* MenuBar at the top */}
      <MenuBar
        showHidden={showHidden}
        onShowHiddenChange={handleShowHiddenChange}
        onViewLocations={() => handleAction("locations")}
        locationsViewActive={activePanel === "locations"}
        locationsPoppedOut={isPoppedOut}
      />

      {/* Character selector below MenuBar */}
      <Box sx={{ mb: 2, mt: 1 }}>
        <CharacterSelector
          shots={allVisibleShots}
          selectedShotId={selectedActorId}
          onSelect={handleCharacterSelect}
        />
      </Box>

      {/* Action bar appears when character is selected */}
      <Box ref={actionBarRef}>
        <EncounterActionBar
          selectedCharacter={selectedCharacter}
          onAction={handleAction}
          activePanel={activePanel}
        />
      </Box>

      {/* Character Detail for selected character */}
      {selectedCharacter && (
        <Box sx={{ mb: 1 }}>
          <CharacterDetail character={selectedCharacter} />
        </Box>
      )}

      {/* Action Panels - Place them here, before the shot list */}
      {activePanel === "attack" && selectedCharacter && (
        <Box ref={attackPanelRef}>
          <AttackPanel
            preselectedAttacker={selectedCharacter}
            onClose={handlePanelClose}
            onComplete={handleActionComplete}
          />
        </Box>
      )}

      {activePanel === "boost" && selectedCharacter && (
        <Box ref={boostPanelRef}>
          <BoostPanel
            preselectedBooster={selectedCharacter}
            onClose={handlePanelClose}
            onComplete={handleActionComplete}
          />
        </Box>
      )}

      {activePanel === "chase" && selectedCharacter && (
        <Box ref={chasePanelRef}>
          <ChasePanel
            preselectedCharacter={selectedCharacter}
            onClose={handlePanelClose}
            onComplete={handleActionComplete}
          />
        </Box>
      )}

      {activePanel === "heal" && selectedCharacter && (
        <Box ref={healPanelRef}>
          <HealPanel
            preselectedCharacter={selectedCharacter}
            onClose={handlePanelClose}
            onComplete={handleActionComplete}
          />
        </Box>
      )}

      {activePanel === "cheese" && selectedCharacter && (
        <Box ref={cheeseItPanelRef}>
          <CheeseItPanel
            preselectedCharacter={selectedCharacter}
            onClose={handlePanelClose}
            onComplete={handleActionComplete}
          />
        </Box>
      )}

      {activePanel === "speedcheck" && (
        <Box ref={speedCheckPanelRef}>
          <SpeedCheckPanel
            selectedCharacter={selectedCharacter}
            onClose={handlePanelClose}
            onComplete={handleActionComplete}
          />
        </Box>
      )}

      {activePanel === "upcheck" && (
        <Box ref={upCheckPanelRef}>
          <UpCheckPanel
            onClose={handlePanelClose}
            onComplete={handleActionComplete}
          />
        </Box>
      )}

      {activePanel === "locations" && !isPoppedOut && (
        <Box ref={locationsPanelRef}>
          <LocationsPanel
            onClose={handlePanelClose}
            onPopOut={handlePopOutLocations}
          />
        </Box>
      )}

      {/* Pop-out window for locations */}
      <PopOutWindow isPoppedOut={isPoppedOut} containerEl={containerEl}>
        <LocationsPanel onClose={popIn} poppedOut />
      </PopOutWindow>

      {/* Shot List */}
      <List>
        {visibleShots.map((shot, index) => (
          <ShotDetail key={`${shot.shot}-${index}`} shot={shot} />
        ))}
      </List>
    </>
  )
}
