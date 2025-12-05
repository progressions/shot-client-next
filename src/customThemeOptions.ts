// Custom theme options for icon categories
export const customThemeOptions: ThemeOptions = {
  palette: {
    error: {
      main: "#f44336",
      dark: "#d32f2f",
    },
    custom: {
      gold: {
        main: "#ffd700",
        light: "#ffea00",
      },
      purple: {
        main: "#ab47bc", // Darker, less lavender purple for Details
        light: "#ce93d8", // Lighter purple for hover
      },
      grey: {
        main: "#424242", // Opaque grey for wounds background
      },
      amber: {
        main: "#f59e0b", // Primary amber accent
        light: "#fbbf24", // Lighter amber for highlights
        dark: "#d97706", // Darker amber
        glow: "rgba(245, 158, 11, 0.3)", // For shadows/glows
        border: "rgba(245, 158, 11, 0.2)", // For borders
        hover: "rgba(251, 191, 36, 0.2)", // For hover states
        bg: "rgba(245, 158, 11, 0.1)", // For backgrounds
      },
      panel: {
        gradient: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
        border: "rgba(255, 255, 255, 0.06)",
        shadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
      },
    },
  },
}
