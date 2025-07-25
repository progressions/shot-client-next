import { Suspense } from "react"
import { redirect } from "next/navigation"
import { CircularProgress, Container, Typography, Box } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import { Fights } from "@/components/fights"
import type { FightsResponse } from "@/types/types"

export const metadata = {
  title: "Chi War"
}

export default async function HomePage() {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  const response = await client.getFights() // Resolve on server for initial load
  const { fights }: FightsResponse = response.data

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ color: "#ffffff" }}>
          Fights
        </Typography>
      </Box>
      <Suspense fallback={<CircularProgress />}>
        <Fights initialFights={fights} />
      </Suspense>
    </Container>
  )
}
