import { Box } from "@mui/material"
import type { Character } from "@/types"
import { UserLink } from "@/components/links"

type OwnerProps = {
  character: Character
}

export default function Owner({ character }: OwnerProps) {
  if (!character.user) return null

  return (
    <Box sx={{ mb: 2, fontSize: "0.8rem", textTransform: "uppercase" }}>
      <UserLink user={character.user} />
    </Box>
  )
}
