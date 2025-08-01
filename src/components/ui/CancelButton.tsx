import {
  Button as MuiButton,
  ButtonProps as MuiButtonProperties,
} from "@mui/material"

export function CancelButton(properties: MuiButtonProperties) {
  if (properties.size == "mini") {
    return (
      <MuiButton
        type="submit"
        variant={properties.variant || "outlined"}
        color="secondary"
        sx={{
          fontSize: "0.75rem",
          padding: "4px 8px",
          minWidth: "auto",
          lineHeight: "1.2",
        }}
        {...properties}
      >
        {properties.children ? properties.children : "Cancel"}
      </MuiButton>
    )
  }
  return (
    <MuiButton
      variant={properties.variant || "outlined"}
      color="secondary"
      {...properties}
    >
      {properties.children ? properties.children : "Cancel"}
    </MuiButton>
  )
}
