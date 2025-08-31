"use client"
import { useTheme } from "@mui/material"
import { useState, useRef, useEffect } from "react"
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@/components/ui"
import { AddCharacter, AddVehicle, AttackPanel } from "@/components/encounters"
import { FaGun } from "react-icons/fa6"

export default function MenuBar() {
  const theme = useTheme()
  const [open, setOpen] = useState<"character" | "vehicle" | "attack" | null>(
    null
  )
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

  return (
    <>
      <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Menu
          </Typography>
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
              overflow: "hidden",
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
    </>
  )
}
