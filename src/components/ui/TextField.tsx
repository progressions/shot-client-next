"use client"

import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProperties,
} from "@mui/material"
import { styled } from "@mui/material/styles"

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: theme.palette.divider,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}))

export function TextField(properties: MuiTextFieldProperties) {
  return <StyledTextField {...properties} />
}
