"use client"
import { useTheme } from "@mui/material"
import { useState, useRef, useEffect } from "react"
import { AppBar, Toolbar, Typography, IconButton, Box, Tooltip } from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/ui"
import { AddCharacter, AddVehicle, AttackPanel, InitiativeDialog } from "@/components/encounters"
import { FaGun, FaPlay } from "react-icons/fa6"
import { useEncounter } from "@/contexts"
import FightService from "@/services/FightService"
import type { Character, Vehicle } from "@/types"

export default function MenuBar() {
  const theme = useTheme()
  const { encounter, updateEncounter } = useEncounter()
  const [open, setOpen] = useState<"character" | "vehicle" | "attack" | null>(
    null
  )
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const toggleBox = (type: "character" | "vehicle" | "attack") => {
    setOpen(current => (current === type ? null : type))
  }

  useEffect(() => {
    if (open && panelRef.current) {
      const timer = setTimeout(() => {
        const panelTop =
          panelRef.current.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: panelTop - 64, // Offset for AppBar height (64px)
          behavior: "smooth",
        })
      }, 300) // Match animation duration (0.3s)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleStartSequence = () => {
    setInitiativeDialogOpen(true)
  }

  const handleApplyInitiatives = async (updatedCharacters: (Character | Vehicle)[]) => {
    // Update the encounter with the new character initiatives
    const updatedShots = encounter.shots.map(shot => ({
      ...shot,
      characters: shot.characters.map(char => {
        const updated = updatedCharacters.find(c => c.id === char.id)
        return updated || char
      }),
      vehicles: shot.vehicles.map(veh => {
        const updated = updatedCharacters.find(v => v.id === veh.id)
        return updated || veh
      }),
    }))

    const updatedEncounter = {
      ...encounter,
      shots: updatedShots,
      sequence: encounter.sequence + 1, // Increment sequence to start new round
    }

    await updateEncounter(updatedEncounter)
    setInitiativeDialogOpen(false)
  }

  // Get all characters and vehicles from the encounter
  const getAllCombatants = () => {
    const characters = FightService.charactersInFight(encounter)
    const vehicles = FightService.vehiclesInFight(encounter)
    return [...characters, ...vehicles]
  }

  // Check if we should show the Start Sequence button
  // Temporarily always show for testing
  const showStartSequence = true // FightService.startOfSequence(encounter)

  return (
    <>
      <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Menu
          </Typography>
          {showStartSequence && (
            <Tooltip title="Start Sequence">
              <IconButton
                onClick={handleStartSequence}
                sx={{ color: "white" }}
              >
                <FaPlay size={20} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            onClick={() => toggleBox("attack")}
            sx={{ color: "white" }}
            title="Attack Resolution"
          >
            <FaGun size={24} />
          </IconButton>
          <IconButton onClick={() => toggleBox("vehicle")}>
            <Icon keyword="Add Vehicle" color="white" />
          </IconButton>
          <IconButton onClick={() => toggleBox("character")}>
            <Icon keyword="Add Character" color="white" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            ref={panelRef}
            key={open}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              backgroundColor: theme.palette.divider,
              zIndex: 1099,
            }}
          >
            <Box sx={{ p: 2, border: "1px solid", borderColor: "grey.300" }}>
              {open === "character" && (
                <AddCharacter
                  open={open === "character"}
                  onClose={() => setOpen(null)}
                />
              )}
              {open === "vehicle" && (
                <AddVehicle
                  open={open === "vehicle"}
                  onClose={() => setOpen(null)}
                />
              )}
              {open === "attack" && <AttackPanel />}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      <InitiativeDialog
        open={initiativeDialogOpen}
        onClose={() => setInitiativeDialogOpen(false)}
        characters={getAllCombatants()}
        onApply={handleApplyInitiatives}
      />
    </>
  )
}
