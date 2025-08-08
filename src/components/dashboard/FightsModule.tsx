import { Box, Stack, Typography } from "@mui/material"
import { getServerClient } from "@/lib/getServerClient"
import { FightBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ErrorModule, ModuleHeader } from "@/components/dashboard"
import type { Fight } from "@/types"

interface FightsModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default async function FightsModule({
  userId,
  size = "medium",
}: FightsModuleProps) {
  const client = await getServerClient()
  if (!client) {
    throw new Error("Failed to initialize client")
  }

  let fights: Fight[] = []
  try {
    const fightsResponse = await client.getFights({
      user_id: userId,
      unended: true,
      per_page: 5,
      sort: "created_at",
      order: "desc",
    })
    fights = fightsResponse.data?.fights || []
  } catch (error) {
    console.error("Error fetching fights:", error)
    return (
      <ErrorModule
        title="Your Fights"
        message="Failed to load fights."
        icon={<Icon keyword="Fights" />}
      />
    )
  }

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
