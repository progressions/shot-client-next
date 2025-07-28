import { Box, Typography } from "@mui/material"
import Link from "next/link"
import { PartyName } from "@/components/parties"
import type { Party } from "@/types/types"

type PartiesModuleProps = {
  parties: Party[]
}

export default function PartiesModule({ parties }: PartiesModuleProps) {
  return (
    <Box sx={{ flexGrow: 1, width: { xs: "100%", sm: "auto" }, p: 2, borderRadius: 2, backgroundColor: "#1d1d1d" }}>
      <Typography variant="h6" gutterBottom>
        Your Parties
      </Typography>
      {parties.map(party => (
        <Box key={party.id} sx={{ mb: 1, p: 1, borderRadius: 1, backgroundColor: "#2d2d2d" }}>
          <Typography variant="body1">
            <Link href={`/parties/${party.id}`} style={{ color: "#fff", textDecoration: "none" }}>
              <PartyName party={party} />
            </Link>
          </Typography>
        </Box>
      ))}
      <Typography variant="body2">
        <Link href="/parties" style={{ color: "#fff", textDecoration: "underline" }}>
          All parties
        </Link>
      </Typography>
    </Box>
  )
}
