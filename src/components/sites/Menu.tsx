"use client"

import { GridView, ViewList } from "@mui/icons-material"
import { CreateSiteForm } from "@/components/sites"
import { SpeedDial, actions as initialActions } from "@/components/ui"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import { useState, useEffect } from "react"

interface MenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function Menu({ viewMode, setViewMode }: MenuProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Listen for onboarding CTA events to open site drawer
  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      setDrawerOpen(true)
    }

    window.addEventListener("openSiteDrawer", handleOpenDrawerEvent)

    return () => {
      window.removeEventListener("openSiteDrawer", handleOpenDrawerEvent)
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

  function handleOpenCreateDrawer() {
    setDrawerOpen(true)
  }
  function handleCloseCreateDrawer() {
    setDrawerOpen(false)
  }

  return (
    <>
      <SpeedDial actions={actions} />
      <CreateSiteForm open={drawerOpen} onClose={handleCloseCreateDrawer} />
    </>
  )
}
