import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material"

export function TextField(props: MuiTextFieldProps) {
  return <MuiTextField {...props} />
}
