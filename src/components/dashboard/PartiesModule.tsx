import { Stack, Box, Typography } from "@mui/material"
import Link from "next/link"
import { PartyBadge } from "@/components/badges"
import type { Party } from "@/types"

type PartiesModuleProperties = {
  parties: Party[]
}

export default function PartiesModule({ parties }: PartiesModuleProperties) {
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
      <Typography variant="h6" gutterBottom>
        Your Parties
      </Typography>
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {parties.map(party => (
          <PartyBadge key={party.id} party={party} size="sm" />
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
