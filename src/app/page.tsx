import { Container, Typography, Box } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import { Fights } from "@/components/fights" // Adjust path based on your project structure

export const metadata = {
  title: "Chi War"
}

export default async function HomePage() {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return // Consider adding a fallback like <Typography>Not logged in</Typography>

  const { data } = await client.getFights() // Resolve on server for initial load

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ color: "#ffffff" }}>
          Fights
        </Typography>
      </Box>
      <Fights initialFights={data.fights} /> {/* Pass resolved fights array as prop */}
    </Container>
  )
}
