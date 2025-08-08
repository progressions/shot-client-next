import theme from "@/theme" // Adjust path to your theme file
const palette = theme.palette

export type Category =
  | "Combat"
  | "Characters"
  | "Affiliations"
  | "Details"
  | "Utility"
  | "Interface"

export const iconColorMap: Record<Category, { color: string; hoverColor: string }> = {
  Combat: { color: palette.error.main, hoverColor: palette.error.dark }, // Using theme's error colors
  Characters: { color: palette.secondary.main, hoverColor: palette.secondary.dark }, // Using #f50057
  Affiliations: { color: palette.custom.gold.main, hoverColor: palette.custom.gold.light }, // From customThemeOptions
  Details: { color: palette.custom.purple.main, hoverColor: palette.custom.purple.light }, // From customThemeOptions
  Utility: { color: palette.primary.main, hoverColor: palette.primary.dark }, // Using #ff8f00
  Interface: { color: palette.primary.main, hoverColor: palette.primary.dark }, // Using #ff8f00
}
