import { Container, Typography, Box } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"

export const metadata = {
  title: "Chi War"
}

export default async function HomePage() {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return

  const data = await client.getFights()
  console.log("fights", data.fights)

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ color: "#ffffff" }}>
          Fights
        </Typography>
      </Box>
    </Container>
  )
}
