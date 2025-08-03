"use client"

import { useState, useEffect } from "react"
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { SystemStyleObject, Theme } from "@mui/system"
import type { MouseEvent } from "react"

type Action = {
  [key: string]: unknown
  icon: React.ReactNode
  name: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
  preventClose?: boolean
}

type SpeedDialMenuProps = {
  onEdit?: () => void
  onDelete?: () => void
  actions?: Action[]
  sx?: SystemStyleObject<Theme>
  open: boolean
  onOpen: () => void
  onClose?: () => void // Made optional
}

export function SpeedDialMenu({
  onEdit,
  onDelete,
  actions: initialActions,
  sx = {},
  open,
  onOpen,
  onClose,
}: SpeedDialMenuProps) {
  const [persist, setPersist] = useState(false)

  // Reset persist when SpeedDial is closed externally
  useEffect(() => {
    if (!open) {
      setPersist(false)
    }
  }, [open])

  const defaultActions = [
    { icon: <DeleteIcon />, name: "Delete", onClick: onDelete },
  ]
  if (onEdit) {
    defaultActions.unshift({
      icon: <EditIcon />,
      name: "Edit",
      onClick: onEdit,
      preventClose: true, // Prevent closing when editing
    })
  }

  const actions = initialActions || defaultActions

  const handleActionClick =
    (action: Action) => (event: MouseEvent<HTMLElement>) => {
      if (action.preventClose) {
        event.stopPropagation()
        setPersist(true)
      } else {
        setPersist(false)
        if (onClose) {
          onClose() // Guarded call to onClose
        }
      }
      if (action.onClick) {
        action.onClick(event)
      }
    }

  const handleClose = () => {
    if (!persist && onClose) {
      onClose() // Guarded call to onClose
    }
  }

  return (
    <SpeedDial
      ariaLabel="Weapon actions"
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
      open={open}
      onOpen={onOpen}
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
