import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material"

export function CancelButton(props: MuiButtonProps) {
  return <MuiButton variant="outlined" color="secondary" {...props} />
}
