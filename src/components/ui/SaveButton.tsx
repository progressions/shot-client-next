import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material"

export function SaveButton(props: MuiButtonProps) {
  return <MuiButton variant="contained" color="primary" {...props} />
}
