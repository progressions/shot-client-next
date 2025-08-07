import { Stack, Box, Typography } from "@mui/material"
import Link from "next/link"
import { PartyBadge } from "@/components/badges"
import type { Party } from "@/types"
import { ModuleHeader } from "@/components/dashboard"
import { Icon } from "@/components/ui"

type PartiesModuleProperties = {
  parties: Party[]
  size: "small" | "medium" | "large"
}

export default function PartiesModule({
  parties,
  size = "medium",
}: PartiesModuleProperties) {
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
      <ModuleHeader title="Your Parties" icon={<Icon keyword="Parties" />} />
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
