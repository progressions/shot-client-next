"use client"

import { redirect } from "next/navigation"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import UploadIcon from "@mui/icons-material/Upload"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import GroupsIcon from "@mui/icons-material/Groups"
import { SpeedDialMenu } from "@/components/ui"
import { useState } from "react"

const handleCreate = () => {
  redirect("/characters/create")
}

const handleGenerate = () => {
  redirect("/characters/generate")
}

const handleImport = () => {
  redirect("/characters/import")
}

const handleGMCTemplates = () => {
  redirect("/characters/gmc")
}

export const actions = [
  { icon: <PersonAddAlt1Icon />, name: "Create (PC)", onClick: handleCreate },
  { icon: <GroupsIcon />, name: "Create (GMC)", onClick: handleGMCTemplates },
  { icon: <UploadIcon />, name: "Import (from PDF)", onClick: handleImport },
  {
    icon: <AddCircleOutlineIcon />,
    name: "Generate (by AI)",
    onClick: handleGenerate,
  },
]

type SpeedDialProps = {
  actions?: typeof actions
}

export default function SpeedDial({
  actions: initialActions = actions,
}: SpeedDialProps) {
  const [open, setOpen] = useState(false)

  return (
    <SpeedDialMenu
      actions={initialActions}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    />
  )
}
