"use client"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { ReactNode } from "react"

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9"
    },
    secondary: {
      main: "#f48fb1"
    },
    background: {
      default: "#121212",
      paper: "#1d1d1d"
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5"
    }
  }
})

type ThemeRegistryProps = {
  children: ReactNode
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
