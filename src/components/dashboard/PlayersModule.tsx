import { Box, Typography } from "@mui/material"
import Link from "next/link"
import type { User } from "@/types/types"
import { UserName } from "@/components/users"

type PlayersModuleProps = {
  players: User[]
}

export default function PlayersModule({ players }: PlayersModuleProps) {
  return (
    <Box sx={{ flexGrow: 1, width: { xs: "100%", sm: "auto" }, p: 2, borderRadius: 2, backgroundColor: "#1d1d1d", alignItems: "center" }}>
      <Typography variant="h6" gutterBottom>
        Players
      </Typography>
      {players.map(player => (
        <Box key={player.id} sx={{ mb: 1, p: 1, borderRadius: 1, backgroundColor: "#2d2d2d" }}>
          <Typography variant="body1">
            <Link href={`/users/${player.id}`} style={{ color: "#fff", textDecoration: "none" }}>
              <UserName user={player} />
            </Link>
          </Typography>
        </Box>
      ))}
      <Typography variant="body2">
        <Link href="/users" style={{ color: "#fff", textDecoration: "underline" }}>
          All users
        </Link>
      </Typography>
    </Box>
  )
}
