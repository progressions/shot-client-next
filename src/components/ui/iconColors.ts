import { themeOptions } from "@/theme" // Adjust path to your theme file
import { customThemeOptions } from "@/customThemeOptions" // Adjust path to your customThemeOptions file

export type Category =
  | "Combat"
  | "Characters"
  | "Affiliations"
  | "Details"
  | "Utility"
  | "Interface"

export const iconColorMap: Record<Category, { color: string; hoverColor: string }> = {
  Combat: { color: customThemeOptions.palette.error.main, hoverColor: customThemeOptions.palette.error.dark }, // #f44336, #d32f2f
  Characters: { color: themeOptions.palette.secondary.main, hoverColor: themeOptions.palette.secondary.dark }, // #f50057, darker variant
  Affiliations: { color: customThemeOptions.palette.custom.gold.main, hoverColor: customThemeOptions.palette.custom.gold.light }, // #ffd700, #ffea00
  Details: { color: customThemeOptions.palette.custom.purple.main, hoverColor: customThemeOptions.palette.custom.purple.light }, // #ab47bc, #ce93d8
  Utility: { color: themeOptions.palette.primary.main, hoverColor: themeOptions.palette.primary.dark }, // #ff8f00, darker variant
  Interface: { color: themeOptions.palette.primary.main, hoverColor: themeOptions.palette.primary.dark }, // #ff8f00, darker variant
}
