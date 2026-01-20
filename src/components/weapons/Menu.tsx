"use client"

import { useRouter, usePathname } from "next/navigation"
import { GridView, ViewList } from "@mui/icons-material"
import { CreateWeaponForm } from "@/components/weapons"
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
  const drawerOpen = pathname === "/weapons/new"

  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      router.push("/weapons/new", { scroll: false })
    }

    window.addEventListener("openWeaponDrawer", handleOpenDrawerEvent)

    return () => {
      window.removeEventListener("openWeaponDrawer", handleOpenDrawerEvent)
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
    router.push("/weapons/new", { scroll: false })
  }
  function handleCloseCreateDrawer() {
    router.push("/weapons", { scroll: false })
  }

  return (
    <>
      <SpeedDial actions={actions} />
      <CreateWeaponForm open={drawerOpen} onClose={handleCloseCreateDrawer} />
    </>
  )
}
