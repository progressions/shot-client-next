import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { SystemStyleObject, Theme } from "@mui/system"

type Action = {
  [key: string]: unknown
  icon: React.ReactNode
  name: string
  onClick?: () => void
}

type SpeedDialMenu = {
  onEdit?: () => void
  onDelete?: () => void
  actions?: Action[]
  sx?: SystemStyleObject<Theme>
}

export function SpeedDialMenu({
  onEdit,
  onDelete,
  actions: initialActions,
  sx = {},
}: SpeedDialMenu) {
  const defaultActions = [
    { icon: <EditIcon />, name: "Edit", onClick: onEdit },
    { icon: <DeleteIcon />, name: "Delete", onClick: onDelete },
  ]

  const actions = initialActions || defaultActions

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
      }}
      icon={<SpeedDialIcon openIcon={<MoreHorizIcon />} />}
      direction="down"
    >
      {actions.map(action => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  )
}
