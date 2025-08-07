import type { Fight } from "@/types"
import { Stack, Box, Typography } from "@mui/material"
import { FightBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ModuleHeader } from "@/components/dashboard"

type FightsModuleProperties = {
  fights: Fight[]
  size: "small" | "medium" | "large"
}

export default function FightsModule({
  fights,
  size = "medium",
}: FightsModuleProperties) {
  const sizeMap = {
    small: "sm",
    medium: "md",
    large: "lg",
  }
  const abbrevSize = sizeMap[size] || "md"
  return (
    <Box
      sx={{
        flexGrow: 1,
        width: { xs: "100%", sm: "auto" },
        p: 2,
        borderRadius: 2,
        backgroundColor: "#2d2d2d",
      }}
    >
      <ModuleHeader title="Your Fights" icon={<Icon keyword="Fights" />} />
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {fights.map(fight => (
          <FightBadge key={fight.id} fight={fight} size={abbrevSize} />
        ))}
      </Stack>
      <Typography variant="body2">
        <Link
          href="/fights"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          All fights
        </Link>
      </Typography>
    </Box>
  )
}
