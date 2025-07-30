import { IconButton, IconButtonProps } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import Tooltip from "@mui/material/Tooltip"

interface DeleteButtonProps extends IconButtonProps {
  // Add custom props if needed, e.g., tooltipTitle: string
  tooltipTitle?: string
}

export function DeleteButton({
  tooltipTitle = "Delete",
  ...props
}: DeleteButtonProps) {
  return (
    <Tooltip title={tooltipTitle}>
      <IconButton
        color="inherit"
        size="small"
        aria-label={tooltipTitle.toLowerCase()}
        {...props}
      >
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  )
}
