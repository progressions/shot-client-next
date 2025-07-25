import { Box, Container, Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Fight } from "@/types/types"
import { FightPageClient } from "@/components/fights"

type FightPageProps = {
  params: Promise<{ id: string }>
}

export default async function FightPage({ params }: FightPageProps) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getFight({ id })
  console.log("Fight response:", response)
  const fight: Fight = response.data

  if (!fight?.id) {
    return <Typography>Fight not found</Typography>
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: { xs: 2, md: 4 },
        px: { xs: 2, md: 3 },
      }}
    >
      <FightPageClient fight={fight} />
    </Container>
  )
}
