import { createTheme } from "@mui/material/styles"
import { ThemeOptions } from "@mui/material/styles"
import { customThemeOptions } from "./customThemeOptions"

export const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#f59e0b", // Warm amber - cinematic action feel
      light: "#fbbf24",
      dark: "#d97706",
      contrastText: "#0a0a0a",
    },
    secondary: {
      main: "#ef4444", // Keep red as accent for danger/damage
      light: "#f87171",
      dark: "#dc2626",
    },
    background: {
      default: "#0a0a0a", // Near-black
      paper: "#141414", // Slightly lighter dark
    },
    divider: "rgba(255, 255, 255, 0.08)",
    text: {
      primary: "#fafafa",
      secondary: "rgba(255, 255, 255, 0.6)",
    },
    action: {
      hover: "rgba(245, 158, 11, 0.08)",
      selected: "rgba(245, 158, 11, 0.16)",
      disabledBackground: "rgba(255, 255, 255, 0.05)",
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
  components: {
    ...themeOptions.components,
    ...customThemeOptions.components, // Ensure customThemeOptions components are merged
  },
})

export default theme
