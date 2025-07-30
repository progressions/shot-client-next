import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProperties,
} from "@mui/material"

export function TextField(properties: MuiTextFieldProperties) {
  return <MuiTextField {...properties} />
}
