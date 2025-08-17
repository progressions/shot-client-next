"use client"

import { GridView, ViewList } from "@mui/icons-material"
import { CampaignForm } from "@/components/campaigns"
import { SpeedDial, actions as initialActions } from "@/components/ui"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import { defaultCampaign, type Campaign } from "@/types"
import { useState } from "react"
import { useClient } from "@/contexts"

interface MenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function Menu({ viewMode, setViewMode }: MenuProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { client } = useClient()
  
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
  async function handleSaveCampaign(formData: FormData, campaignData: Campaign) {
    try {
      await client.createCampaign(formData)
      setDrawerOpen(false)
    } catch (error) {
      console.error("Error creating campaign:", error)
      throw error
    }
  }

  return (
    <>
      <SpeedDial actions={actions} />
      <CampaignForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveCampaign}
        initialFormData={defaultCampaign}
        title="Create Campaign"
      />
    </>
  )
}