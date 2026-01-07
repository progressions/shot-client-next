import { Chip, ChipProps } from "@mui/material"
import type { PartyRole } from "@/types"

interface RoleBadgeProps {
  role: PartyRole
  size?: ChipProps["size"]
  className?: string
}

// Role display configuration
const roleConfig: Record<
  PartyRole,
  { label: string; color: string; bgcolor: string }
> = {
  boss: {
    label: "Boss",
    color: "#fff",
    bgcolor: "#dc2626", // Red
  },
  featured_foe: {
    label: "Featured Foe",
    color: "#fff",
    bgcolor: "#ea580c", // Orange
  },
  mook: {
    label: "Mook",
    color: "#fff",
    bgcolor: "#525252", // Gray
  },
  ally: {
    label: "Ally",
    color: "#fff",
    bgcolor: "#16a34a", // Green
  },
}

export default function RoleBadge({
  role,
  size = "small",
  className,
}: RoleBadgeProps) {
  const config = roleConfig[role]

  if (!config) {
    return null
  }

  return (
    <Chip
      label={config.label}
      size={size}
      className={className}
      sx={{
        backgroundColor: config.bgcolor,
        color: config.color,
        fontWeight: 600,
        textTransform: "uppercase",
        fontSize: size === "small" ? "0.65rem" : "0.75rem",
        letterSpacing: "0.05em",
        height: size === "small" ? 20 : 24,
        "& .MuiChip-label": {
          px: size === "small" ? 1 : 1.5,
        },
      }}
    />
  )
}

// Helper to get role display name
export function getRoleDisplayName(role: PartyRole): string {
  return roleConfig[role]?.label ?? role
}

// Helper to get role color (useful for other components)
export function getRoleColor(role: PartyRole): string {
  return roleConfig[role]?.bgcolor ?? "#525252"
}

// Helper to get full role config (useful for custom rendering)
export function getRoleConfig(role: PartyRole) {
  return roleConfig[role] ?? roleConfig.mook
}
