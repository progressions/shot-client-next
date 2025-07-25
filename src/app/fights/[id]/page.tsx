import { Box, Container, Typography } from "@mui/material"
import { FightName } from "@/components/fights"
import type { Fight } from "@/types/types"
import { RichTextRenderer } from "@/components/editor"
import { getServerClient, getUser } from "@/lib/getServerClient"

type FightPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function FightPage({ params }: FightPageProps) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getFight({ id })
  const fight: Fight = response.data

  if (!fight?.id) {
    return <Typography>Fight not found</Typography>
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: { xs: 2, md: 4 }, // Smaller margin top on mobile
        px: { xs: 2, md: 3 }, // Adjust padding for mobile
      }}
    >
      <Box
        sx={{
          mb: { xs: 1, md: 2 }, // Smaller margin bottom on mobile
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#ffffff",
            fontSize: { xs: "1.25rem", md: "1.5rem" }, // Smaller font on mobile
            mb: { xs: 1, md: 2 },
          }}
        >
          {fight.name}
        </Typography>
        <RichTextRenderer html={fight.description} />
      </Box>
    </Container>
  )
}
