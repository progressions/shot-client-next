import PersonAddIcon from "@mui/icons-material/PersonAdd"
import { Button } from "@mui/material"

type AddButtonProps = {
  onClick: () => void
  disabled?: boolean
}

export function AddButton({ onClick, disabled = false }: AddButtonProps) {
  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={onClick}
      size="small"
      disabled={disabled}
      sx={{ height: "2.5rem", px: 2 }}
      aria-label="Add Party to Fight"
    >
      <PersonAddIcon />
    </Button>
  )
}
