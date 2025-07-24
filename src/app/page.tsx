import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Container, Typography, Box, Button, Avatar } from "@mui/material"
import { User } from "types/types"
import { getUser, getServerClient } from "@/lib/getServerClient"

export const metadata = {
  title: "Chi War"
}

async function logoutAction() {
  "use server"
  const client = await getServerClient()
  if (client) {
    await client.delete("/users/sign_out")
  }
  cookies().delete("jwtToken")
  redirect("/login")
}

export default async function HomePage() {
  const client = await getServerClient()
  const user = await getUser()
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
