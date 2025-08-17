"use client"

import { GridView, ViewList } from "@mui/icons-material"
import { CreateJunctureForm } from "@/components/junctures"
import { SpeedDial, actions as initialActions } from "@/components/ui"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import { useState } from "react"

interface MenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function Menu({ viewMode, setViewMode }: MenuProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const handleToggleView = () => {
    setViewMode(viewMode === "table" ? "mobile" : "table")
  }

  const actions = [
    {
      icon: viewMode === "table" ? <GridView /> : <ViewList />,
      name:
        viewMode === "table" ? "Switch to Mobile View" : "Switch to Table View",
      onClick: handleToggleView,
    },
    {
      icon: <PersonAddAlt1Icon />,
      name: "Create",
      onClick: handleOpenCreateDrawer,
    },
    ...initialActions,
  ]

  function handleOpenCreateDrawer() {
    setDrawerOpen(true)
  }
  function handleCloseCreateDrawer() {
    setDrawerOpen(false)
  }

  return (
    <>
      <SpeedDial actions={actions} />
      <CreateJunctureForm open={drawerOpen} onClose={handleCloseCreateDrawer} />
    </>
  )
}
