"use client"

import { GridView, ViewList } from "@mui/icons-material"
import { CreateAdventureForm } from "@/components/adventures"
import { SpeedDial, actions as initialActions } from "@/components/ui"
import AddIcon from "@mui/icons-material/Add"
import { useState, useEffect } from "react"

interface MenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function Menu({ viewMode, setViewMode }: MenuProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      setDrawerOpen(true)
    }

    window.addEventListener("openAdventureDrawer", handleOpenDrawerEvent)

    return () => {
      window.removeEventListener("openAdventureDrawer", handleOpenDrawerEvent)
    }
  }, [])

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
      icon: <AddIcon />,
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
      <CreateAdventureForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
      />
    </>
  )
}
