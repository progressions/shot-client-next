import { Button as MuiButton, ButtonProps as MuiButtonProps } from "@mui/material"

interface ButtonProps extends MuiButtonProps {
  // Add any custom props if needed, e.g., loading state
}

export function Button(props: ButtonProps) {
  return <MuiButton {...props} />
}
