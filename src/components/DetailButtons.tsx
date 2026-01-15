import { Box, IconButton, Tooltip } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"

type DetailButtonsProps = {
  name: string
  onEdit?: () => void
  onDelete: () => Promise<void>
}

export default function DetailButtons({
  name,
  onEdit,
  onDelete,
}: DetailButtonsProps) {
  return (
    <Box sx={{ display: "flex", gap: "0.5rem" }}>
      {onEdit && (
        <Tooltip title={`Edit ${name}`}>
          <IconButton color="inherit" onClick={onEdit} size="small">
            <EditIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={`Delete ${name}`}>
        <IconButton color="inherit" onClick={onDelete} size="small">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
