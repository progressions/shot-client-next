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
        border: "rgba(245, 255, 255, 0.1)", // For borders
        hover: "rgba(245, 158, 11, 0.15)", // For hover states
        bg: "rgba(245, 158, 11, 0.9)", // For active backgrounds
      },
      panel: {
        gradient: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
        border: "rgba(255, 255, 255, 0.06)",
        shadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
        bg: "rgba(26, 26, 26, 0.8)", // Button inactive background
      },
      disabled: {
        bg: "rgba(15, 15, 15, 0.8)",
        border: "rgba(255, 255, 255, 0.05)",
        text: "#52525b",
      },
      neutral: {
        text: "#d4d4d8", // Inactive text
        textLight: "#fafafa", // Hover/active text
      },
    },
  },
}
