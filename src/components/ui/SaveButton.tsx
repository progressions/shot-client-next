import {
  Button as MuiButton,
  ButtonProps as MuiButtonProperties,
} from "@mui/material"

export function SaveButton(properties: MuiButtonProperties) {
  if (properties.size == "mini") {
    return (
      <MuiButton
        type="submit"
        variant="contained"
        color="primary"
        sx={{
          fontSize: "0.75rem",
          padding: "4px 8px",
          minWidth: "auto",
          lineHeight: "1.2",
        }}
        {...properties}
      >
        {properties.children ? properties.children : "Save"}
      </MuiButton>
    )
  }
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
