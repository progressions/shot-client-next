import { Box, Stack, Typography } from "@mui/material"
import { getServerClient } from "@/lib/getServerClient"
import { PartyBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ModuleHeader } from "@/components/dashboard"
import type { Party } from "@/types"

interface PartiesModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default async function PartiesModule({
  userId,
  size = "medium",
}: PartiesModuleProps) {
  const client = await getServerClient()
  if (!client) {
    throw new Error("Failed to initialize client")
  }

  const partiesResponse = await client.getParties({
    user_id: userId,
    per_page: 5,
    sort: "created_at",
    order: "desc",
  })
  const parties: Party[] = partiesResponse.data?.parties || []

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
      <ModuleHeader title="Your Parties" icon={<Icon keyword="Party" />} />
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {parties.map(party => (
          <PartyBadge key={party.id} party={party} size={abbrevSize} />
        ))}
      </Stack>
      <Typography variant="body2">
        <Link
          href="/parties"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          All parties
        </Link>
      </Typography>
    </Box>
  )
}
