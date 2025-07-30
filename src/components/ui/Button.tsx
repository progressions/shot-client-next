import {
  Button as MuiButton,
  ButtonProps as MuiButtonProperties,
} from "@mui/material"

export function Button(properties: MuiButtonProperties) {
  return <MuiButton {...properties} />
}
