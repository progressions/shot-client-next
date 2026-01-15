"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { SystemStyleObject, Theme } from "@mui/system"
import type { MouseEvent, SyntheticEvent } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Faction } from "@/types"
import { useClient, useConfirm, useToast } from "@/contexts"

type Action = {
  [key: string]: unknown
  icon: React.ReactNode
  name: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
  preventClose?: boolean
}

type FactionSpeedDialProps = {
  faction: Faction
  onDelete: () => Promise<void>
  sx?: SystemStyleObject<Theme>
}

export default function FactionSpeedDial({
  faction,
  onDelete,
  sx = {},
}: FactionSpeedDialProps) {
  const { client } = useClient()
  const { confirm } = useConfirm()
  const { toastError } = useToast()
  const router = useRouter()
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const [persist, setPersist] = useState(false)

  // Reset persist when SpeedDial is closed externally
  useEffect(() => {
    if (!speedDialOpen) {
      setPersist(false)
    }
  }, [speedDialOpen])

  const handleDelete = async () => {
    if (!faction?.id) return
    const confirmed = await confirm({
      title: "Delete Faction",
      message: `Are you sure you want to delete the faction: ${faction.name || "Unnamed"}?`,
      confirmText: "Delete",
      destructive: true,
    })
    if (!confirmed) return
    try {
      await onDelete()
    } catch (error_) {
      console.error("Failed to delete faction:", error_)
      toastError("Failed to delete faction.")
    }
  }

  const handleDuplicate = async () => {
    if (!faction?.id) return
    try {
      const response = await client.duplicateFaction(faction)
      const newFaction = response.data
      router.push(`/factions/${newFaction.id}`)
    } catch (error_) {
      console.error("Failed to duplicate faction:", error_)
      toastError("Failed to duplicate faction.")
    } finally {
      setSpeedDialOpen(false)
    }
  }

  const actions = [
    { icon: <ContentCopyIcon />, name: "Copy", onClick: handleDuplicate },
    { icon: <DeleteIcon />, name: "Delete", onClick: handleDelete },
  ]

  const handleActionClick =
    (action: Action) => (event: MouseEvent<HTMLElement>) => {
      if (action.preventClose) {
        event.stopPropagation()
        setPersist(true)
      } else {
        setPersist(false)
        setSpeedDialOpen(false)
      }
      if (action.onClick) {
        action.onClick(event)
      }
    }

  const handleOpen = (_event: SyntheticEvent, reason: string) => {
    if (reason !== "toggle") {
      return
    }

    setSpeedDialOpen(true)
  }

  const handleClose = (_event: SyntheticEvent, reason: string) => {
    if (reason === "escapeKeyDown") {
      setPersist(false)
      setSpeedDialOpen(false)
      return
    }

    if (reason !== "toggle") {
      return
    }

    if (persist) {
      setPersist(false)
      return
    }

    setSpeedDialOpen(false)
  }

  return (
    <SpeedDial
      ariaLabel="Faction actions"
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
      onOpen={handleOpen}
      onClose={handleClose}
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
