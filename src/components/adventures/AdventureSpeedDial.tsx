"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { SystemStyleObject, Theme } from "@mui/system"
import type { MouseEvent } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Adventure } from "@/types"
import { useClient, useConfirm, useToast } from "@/contexts"

type Action = {
  [key: string]: unknown
  icon: React.ReactNode
  name: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
  preventClose?: boolean
}

type AdventureSpeedDialProps = {
  adventure: Adventure
  onDelete: () => Promise<void>
  sx?: SystemStyleObject<Theme>
}

export default function AdventureSpeedDial({
  adventure,
  onDelete,
  sx = {},
}: AdventureSpeedDialProps) {
  const { client } = useClient()
  const { confirm } = useConfirm()
  const { toastError } = useToast()
  const router = useRouter()
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const [persist, setPersist] = useState(false)

  useEffect(() => {
    if (!speedDialOpen) {
      setPersist(false)
    }
  }, [speedDialOpen])

  const handleDelete = async () => {
    if (!adventure?.id) return
    const confirmed = await confirm({
      title: "Delete Adventure",
      message: `Are you sure you want to delete the adventure: ${adventure.name || "Unnamed"}?`,
      confirmText: "Delete",
      destructive: true,
    })
    if (!confirmed) return
    try {
      await onDelete()
    } catch (error_) {
      console.error("Failed to delete adventure:", error_)
      toastError("Failed to delete adventure.")
    }
  }

  const handleDuplicate = async () => {
    if (!adventure?.id) return
    try {
      const response = await client.duplicateAdventure(adventure)
      const newAdventure = response.data
      router.push(`/adventures/${newAdventure.id}`)
    } catch (error_) {
      console.error("Failed to duplicate adventure:", error_)
      toastError("Failed to duplicate adventure.")
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

  return (
    <SpeedDial
      ariaLabel="Adventure actions"
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
      onClose={() => {
        if (!persist) {
          setSpeedDialOpen(false)
        }
      }}
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
