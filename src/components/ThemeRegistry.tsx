"use client"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
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
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #424242",
          borderRadius: "0.5rem",
          backgroundColor: "#1e1e1e",
          transition: "border-color 0.3s ease",
          "&:hover": {
            borderColor: "#616161"
          },
          boxShadow: "none"
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "1rem",
          "&:last-child": {
            paddingBottom: "1rem"
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          textTransform: "none",
          fontWeight: 600,
          padding: "0.5rem 1rem" // Consistent padding
        }
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            "&:hover": {
              backgroundColor: "#64b5f6" // Slightly darker primary for hover
            }
          }
        },
        {
          props: { variant: "outlined", color: "secondary" },
          style: {
            borderColor: "#f48fb1",
            color: "#f48fb1",
            "&:hover": {
              borderColor: "#f06292", // Slightly darker secondary
              backgroundColor: "rgba(244, 143, 177, 0.08)" // Subtle background on hover
            }
          }
        }
      ]
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-input": {
            color: "#ffffff"
          },
          "& .MuiInputLabel-root": {
            color: "#b0bec5"
          }
        }
      },
      defaultProps: {
        variant: "outlined",
        fullWidth: true
      }
    }
  },
  typography: {
    fontFamily: "Roboto, sans-serif"
  }
})

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
