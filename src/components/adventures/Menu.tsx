"use client"

import { useRouter, usePathname } from "next/navigation"
import { GridView, ViewList } from "@mui/icons-material"
import { CreateAdventureForm } from "@/components/adventures"
import { SpeedDial, actions as initialActions } from "@/components/ui"
import AddIcon from "@mui/icons-material/Add"
import { useEffect } from "react"

interface MenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function Menu({ viewMode, setViewMode }: MenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const drawerOpen = pathname === "/adventures/new"

  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      router.push("/adventures/new", { scroll: false })
    }

    window.addEventListener("openAdventureDrawer", handleOpenDrawerEvent)

    return () => {
      window.removeEventListener("openAdventureDrawer", handleOpenDrawerEvent)
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
      icon: <AddIcon />,
      name: "Create",
      onClick: handleOpenCreateDrawer,
    },
    ...initialActions,
  ]

  function handleOpenCreateDrawer() {
    router.push("/adventures/new", { scroll: false })
  }
  function handleCloseCreateDrawer() {
    router.push("/adventures", { scroll: false })
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
