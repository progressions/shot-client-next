"use client"

import { useRouter, usePathname } from "next/navigation"
import { GridView, ViewList } from "@mui/icons-material"
import { CreateVehicleForm } from "@/components/vehicles"
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
  const drawerOpen = pathname === "/vehicles/new"

  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      router.push("/vehicles/new", { scroll: false })
    }

    window.addEventListener("openVehicleDrawer", handleOpenDrawerEvent)

    return () => {
      window.removeEventListener("openVehicleDrawer", handleOpenDrawerEvent)
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
    router.push("/vehicles/new", { scroll: false })
  }
  function handleCloseCreateDrawer() {
    router.push("/vehicles", { scroll: false })
  }

  function handleVehicleCreated() {
    // Dispatch custom event to refresh vehicles list
    window.dispatchEvent(new CustomEvent("vehicleCreated"))
  }

  return (
    <>
      <SpeedDial actions={actions} />
      <CreateVehicleForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onVehicleCreated={handleVehicleCreated}
      />
    </>
  )
}
