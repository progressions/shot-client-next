import { createTheme } from "@mui/material/styles"
import { ThemeOptions } from "@mui/material/styles"
import { customThemeOptions } from "./customThemeOptions"

export const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#ff8f00",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#310000",
      paper: "#731010",
    },
  },
  shape: {
    borderRadius: 8,
  },
}

// Merge custom and base theme options
const theme = createTheme({
  ...themeOptions,
  palette: {
    ...themeOptions.palette,
    ...customThemeOptions.palette,
  },
})

export default theme
