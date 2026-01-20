"use client"

import { useRouter, usePathname } from "next/navigation"
import { GridView, ViewList } from "@mui/icons-material"
import { CreateSiteForm } from "@/components/sites"
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
  const drawerOpen = pathname === "/sites/new"

  // Listen for onboarding CTA events to open site drawer
  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      router.push("/sites/new", { scroll: false })
    }

    window.addEventListener("openSiteDrawer", handleOpenDrawerEvent)

    return () => {
      window.removeEventListener("openSiteDrawer", handleOpenDrawerEvent)
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
    router.push("/sites/new", { scroll: false })
  }
  function handleCloseCreateDrawer() {
    router.push("/sites", { scroll: false })
  }

  return (
    <>
      <SpeedDial actions={actions} />
      <CreateSiteForm open={drawerOpen} onClose={handleCloseCreateDrawer} />
    </>
  )
}
