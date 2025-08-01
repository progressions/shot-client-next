import {
  Button as MuiButton,
  ButtonProps as MuiButtonProperties,
} from "@mui/material"

export function CancelButton(properties: MuiButtonProperties) {
  return (
    <MuiButton variant={properties.variant || "outlined"} color="secondary" {...properties}>
      {properties.children ? properties.children : "Cancel"}
    </MuiButton>
  )
}
