"use client"
import { useTheme } from "@mui/material"
import { useState, useRef, useEffect } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  ButtonGroup,
  Button,
  Divider,
  FormControlLabel,
  Checkbox,
  Stack,
  Paper,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/ui"
import {
  AddCharacter,
  AddVehicle,
  AttackPanel,
  ChasePanel,
  InitiativeDialog,
  LocationsDialog,
} from "@/components/encounters"
import { FaGun, FaPlay, FaPlus, FaMinus, FaCar } from "react-icons/fa6"
import { FaMapMarkerAlt, FaCaretRight, FaCaretDown } from "react-icons/fa"
import { MdAdminPanelSettings } from "react-icons/md"
import { useEncounter, useClient, useToast } from "@/contexts"
import FightService from "@/services/FightService"
import type { Character, Vehicle } from "@/types"

interface MenuBarProps {
  showHidden: boolean
  onShowHiddenChange: (show: boolean) => void
}

export default function MenuBar({
  showHidden,
  onShowHiddenChange,
}: MenuBarProps) {
  const theme = useTheme()
  const { encounter, updateEncounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [open, setOpen] = useState<
    "character" | "vehicle" | "attack" | "chase" | "admin" | null
  >(null)
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false)
  const [locationsDialogOpen, setLocationsDialogOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const toggleBox = (type: "character" | "vehicle" | "attack" | "chase" | "admin") => {
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

  const handleSequenceChange = async (delta: number) => {
    const newSequence = Math.max(1, (encounter.sequence || 1) + delta)
    const updatedEncounter = {
      ...encounter,
      sequence: newSequence,
    }
    await updateEncounter(updatedEncounter)
  }

  const handleApplyInitiatives = async (
    updatedCharacters: (Character | Vehicle)[]
  ) => {
    try {
      // Build shots array for batch update
      const shots = updatedCharacters.map(char => {
        // Find the shot_id for this character
        const shot = encounter.shots
          .flatMap(s => s.characters || [])
          .find(c => c.id === char.id)
        
        if (shot && shot.shot_id) {
          return {
            id: shot.shot_id,
            shot: char.current_shot
          }
        }
        return null
      }).filter(Boolean)

      // Batch update all shots with new initiative values
      if (shots.length > 0) {
        await client.updateInitiatives(encounter.id, shots)
      }
      
      // Increment the sequence
      await updateEncounter({
        ...encounter,
        sequence: encounter.sequence + 1,
      })
      
      toastSuccess("Initiative set and sequence started!")
      setInitiativeDialogOpen(false)
    } catch (error) {
      console.error("Error applying initiatives:", error)
      toastError("Failed to apply initiatives")
    }
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
          {/* Admin Panel Toggle and Sequence Display */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <Tooltip
              title={
                open === "admin" ? "Close Admin Panel" : "Open Admin Panel"
              }
            >
              <IconButton
                onClick={() => toggleBox("admin")}
                sx={{
                  color: "white",
                  p: 0.5,
                  mr: 1,
                  backgroundColor:
                    open === "admin"
                      ? "rgba(255, 255, 255, 0.2)"
                      : "transparent",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor:
                      open === "admin"
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {open === "admin" ? (
                  <FaCaretDown size={20} />
                ) : (
                  <FaCaretRight size={20} />
                )}
              </IconButton>
            </Tooltip>
            <Typography
              variant="h6"
              sx={{
                minWidth: 80,
                fontWeight: "bold",
              }}
            >
              Sequence {encounter.sequence || 1}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Action Buttons */}
          <IconButton
            onClick={() => toggleBox("attack")}
            sx={{
              color: "white",
              px: { xs: 0.5, sm: 1 },
              backgroundColor:
                open === "attack" ? "rgba(255, 255, 255, 0.2)" : "transparent",
              borderRadius: 1,
              "&:hover": {
                backgroundColor:
                  open === "attack"
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(255, 255, 255, 0.1)",
              },
            }}
            title="Attack Resolution"
          >
            <FaGun size={20} />
          </IconButton>
          <IconButton
            onClick={() => toggleBox("chase")}
            sx={{
              color: "white",
              px: { xs: 0.5, sm: 1 },
              backgroundColor:
                open === "chase" ? "rgba(255, 255, 255, 0.2)" : "transparent",
              borderRadius: 1,
              "&:hover": {
                backgroundColor:
                  open === "chase"
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(255, 255, 255, 0.1)",
              },
            }}
            title="Vehicle Chase"
          >
            <FaCar size={20} />
          </IconButton>
          <Divider
            orientation="vertical"
            sx={{
              mx: { xs: 0.5, sm: 1 },
              height: 24,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          />
          <IconButton
            onClick={() => toggleBox("vehicle")}
            sx={{
              px: { xs: 0.5, sm: 1 },
              backgroundColor:
                open === "vehicle" ? "rgba(255, 255, 255, 0.2)" : "transparent",
              borderRadius: 1,
              "&:hover": {
                backgroundColor:
                  open === "vehicle"
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <Icon keyword="Add Vehicle" color="white" />
          </IconButton>
          <IconButton
            onClick={() => toggleBox("character")}
            sx={{
              px: { xs: 0.5, sm: 1 },
              backgroundColor:
                open === "character"
                  ? "rgba(255, 255, 255, 0.2)"
                  : "transparent",
              borderRadius: 1,
              "&:hover": {
                backgroundColor:
                  open === "character"
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <Icon keyword="Add Character" color="white" />
          </IconButton>
          <Divider
            orientation="vertical"
            sx={{
              mx: { xs: 0.5, sm: 1 },
              height: 24,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          />
          <IconButton
            onClick={() => setLocationsDialogOpen(true)}
            sx={{
              color: "white",
              px: { xs: 0.5, sm: 1 },
              backgroundColor: locationsDialogOpen
                ? "rgba(255, 255, 255, 0.2)"
                : "transparent",
              borderRadius: 1,
              "&:hover": {
                backgroundColor: locationsDialogOpen
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.1)",
              },
            }}
            title="View Locations"
          >
            <FaMapMarkerAlt size={18} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Collapsible Panels */}
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
              {open === "admin" && (
                <Box sx={{ maxWidth: 1200, mx: "auto" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <MdAdminPanelSettings size={24} />
                    Fight Admin
                  </Typography>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    {/* Sequence Controls */}
                    <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        Sequence Control
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography sx={{ mr: 1 }}>
                          Current: {encounter.sequence || 1}
                        </Typography>
                        <ButtonGroup size="small" variant="contained">
                          <Button
                            onClick={() => handleSequenceChange(-1)}
                            sx={{
                              minWidth: 32,
                              p: 0.5,
                            }}
                          >
                            <FaMinus size={12} />
                          </Button>
                          <Button
                            onClick={() => handleSequenceChange(1)}
                            sx={{
                              minWidth: 32,
                              p: 0.5,
                            }}
                          >
                            <FaPlus size={12} />
                          </Button>
                        </ButtonGroup>
                      </Box>
                    </Paper>

                    {/* Initiative Button */}
                    {showStartSequence && (
                      <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, fontWeight: "bold" }}
                        >
                          Initiative
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<FaPlay />}
                          onClick={handleStartSequence}
                          fullWidth
                          sx={{
                            backgroundColor: initiativeDialogOpen
                              ? "primary.dark"
                              : "primary.main",
                          }}
                        >
                          Roll Initiative
                        </Button>
                      </Paper>
                    )}

                    {/* View Options */}
                    <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        View Options
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showHidden}
                            onChange={e => onShowHiddenChange(e.target.checked)}
                            size="small"
                          />
                        }
                        label="Show Hidden Characters"
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            fontSize: "0.875rem",
                          },
                        }}
                      />
                    </Paper>
                  </Stack>
                </Box>
              )}
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
              {open === "attack" && (
                <AttackPanel onClose={() => setOpen(null)} />
              )}
              {open === "chase" && (
                <ChasePanel onClose={() => setOpen(null)} />
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <InitiativeDialog
        open={initiativeDialogOpen}
        onClose={() => setInitiativeDialogOpen(false)}
        characters={getAllCombatants()}
        onApply={handleApplyInitiatives}
      />
      <LocationsDialog
        open={locationsDialogOpen}
        onClose={() => setLocationsDialogOpen(false)}
      />
    </>
  )
}
