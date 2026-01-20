"use client"

import { useRouter, usePathname } from "next/navigation"
import { GridView, ViewList } from "@mui/icons-material"
import { FactionForm } from "@/components/factions"
import { SpeedDial, actions as initialActions } from "@/components/ui"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import { useEffect } from "react"

interface MenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function Menu({ viewMode, setViewMode }: MenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const drawerOpen = pathname === "/factions/new"

  // Listen for onboarding CTA events to open faction drawer
  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      router.push("/factions/new", { scroll: false })
    }

    window.addEventListener("openFactionDrawer", handleOpenDrawerEvent)

    return () => {
      window.removeEventListener("openFactionDrawer", handleOpenDrawerEvent)
    }
  }, [router])

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
    router.push("/factions/new", { scroll: false })
  }
  function handleCloseCreateDrawer() {
    router.push("/factions", { scroll: false })
  }

  return (
    <>
      <SpeedDial actions={actions} />
      <FactionForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        title="Create Faction"
      />
    </>
  )
}
