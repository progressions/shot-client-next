"use client"

import { useRouter, usePathname } from "next/navigation"
import { GridView, ViewList } from "@mui/icons-material"
import { CreateJunctureForm } from "@/components/junctures"
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
  const drawerOpen = pathname === "/junctures/new"

  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      router.push("/junctures/new", { scroll: false })
    }

    window.addEventListener("openJunctureDrawer", handleOpenDrawerEvent)

    return () => {
      window.removeEventListener("openJunctureDrawer", handleOpenDrawerEvent)
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
    router.push("/junctures/new", { scroll: false })
  }
  function handleCloseCreateDrawer() {
    router.push("/junctures", { scroll: false })
  }

  function handleJunctureCreated() {
    // Dispatch custom event to refresh junctures list
    window.dispatchEvent(new CustomEvent("junctureCreated"))
  }

  return (
    <>
      <SpeedDial actions={actions} />
      <CreateJunctureForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onJunctureCreated={handleJunctureCreated}
      />
    </>
  )
}
