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
        <Typography variant="h4" sx={{ color: "#ffffff" }}>
          Welcome, {user.name}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar src={user.image_url ?? undefined} alt={user.name} sx={{ width: 56, height: 56, mr: 2 }} />
        <Box>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            Email: {user.email}
          </Typography>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            Name: {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            ID: {user.id}
          </Typography>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            Admin: {user.admin ? "Yes" : "No"}
          </Typography>
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            Gamemaster: {user.gamemaster ? "Yes" : "No"}
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
