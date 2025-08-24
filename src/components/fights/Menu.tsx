"use client"

import { GridView, ViewList } from "@mui/icons-material"
import { CreateFightForm } from "@/components/fights"
import { SpeedDial, actions as initialActions } from "@/components/ui"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import { defaultFight } from "@/types"
import { useState, useEffect } from "react"

interface MenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function Menu({ viewMode, setViewMode }: MenuProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Listen for onboarding CTA events to open fight drawer
  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      setDrawerOpen(true)
    }

    window.addEventListener("openFightDrawer", handleOpenDrawerEvent)

    return () => {
      window.removeEventListener("openFightDrawer", handleOpenDrawerEvent)
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
      icon: <PersonAddAlt1Icon />,
      name: "Create",
      onClick: handleOpenCreateDrawer,
    },
    ...initialActions,
  ]

  const defaultEntity = defaultFight

  function handleOpenCreateDrawer() {
    setDrawerOpen(true)
  }
  function handleCloseCreateDrawer() {
    setDrawerOpen(false)
  }
  function handleSave() {
    setDrawerOpen(false)
  }

  return (
    <>
      <SpeedDial actions={actions} />
      <CreateFightForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSave}
        initialFormData={{ defaultEntity }}
      />
    </>
  )
}
