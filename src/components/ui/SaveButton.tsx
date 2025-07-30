import {
  Button as MuiButton,
  ButtonProps as MuiButtonProperties,
} from "@mui/material"

export function SaveButton(properties: MuiButtonProperties) {
  return (
    <MuiButton
      type="submit"
      variant="contained"
      color="primary"
      {...properties}
    >
      {properties.children ? properties.children : "Save"}
    </MuiButton>
  )
}
