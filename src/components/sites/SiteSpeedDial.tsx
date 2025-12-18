"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { SystemStyleObject, Theme } from "@mui/system"
import type { MouseEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Site } from "@/types"
import { useClient, useConfirm } from "@/contexts"

type Action = {
  [key: string]: unknown
  icon: React.ReactNode
  name: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
}

type SiteSpeedDialProps = {
  site: Site
  onDelete?: () => void
  sx?: SystemStyleObject<Theme>
}

export default function SiteSpeedDial({
  site,
  onDelete,
  sx = {},
}: SiteSpeedDialProps) {
  const { client } = useClient()
  const { confirm } = useConfirm()
  const router = useRouter()
  const [speedDialOpen, setSpeedDialOpen] = useState(false)

  const handleDelete = async () => {
    if (!site?.id) return
    const confirmed = await confirm({
      title: "Delete Site",
      message: `Are you sure you want to delete the site: ${site.name || "Unnamed"}?`,
      confirmText: "Delete",
      destructive: true,
    })
    if (!confirmed) return
    try {
      if (onDelete) {
        onDelete()
      } else {
        await client.deleteSite(site)
        router.push("/sites")
      }
    } catch (error_) {
      console.error("Failed to delete site:", error_)
    } finally {
      setSpeedDialOpen(false)
    }
  }

  const handleDuplicate = async () => {
    if (!site?.id) return
    try {
      const response = await client.duplicateSite(site)
      const newSite = response.data
      router.push(`/sites/${newSite.id}`)
    } catch (error_) {
      console.error("Failed to duplicate site:", error_)
    } finally {
      setSpeedDialOpen(false)
    }
  }

  const actions = [
    { icon: <PeopleAltIcon />, name: "Copy", onClick: handleDuplicate },
    { icon: <DeleteIcon />, name: "Delete", onClick: handleDelete },
  ]

  const handleActionClick =
    (action: Action) => (event: MouseEvent<HTMLElement>) => {
      setSpeedDialOpen(false)
      if (action.onClick) {
        action.onClick(event)
      }
    }

  return (
    <SpeedDial
      ariaLabel="Site actions"
      sx={{
        position: "absolute",
        right: 0,
        "& .MuiSpeedDial-fab": {
          width: 36,
          height: 36,
          minHeight: 36,
          boxShadow: "none",
        },
        ...sx,
      }}
      icon={<SpeedDialIcon openIcon={<MoreHorizIcon />} />}
      direction="down"
      open={speedDialOpen}
      onOpen={() => setSpeedDialOpen(true)}
      onClose={() => setSpeedDialOpen(false)}
    >
      {actions.map(action => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={handleActionClick(action)}
        />
      ))}
    </SpeedDial>
  )
}
