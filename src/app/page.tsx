import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Container, Typography, Box, Button, Avatar } from "@mui/material"
import { User } from "types/types"

export const metadata = {
  title: "Chi War"
}

async function getUser() {
  const cookie = await cookies()
  const token = cookie.get("jwtToken")?.value
  if (!token) {
    redirect("/login")
  }
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/current`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      cache: "no-store" // Ensure fresh data on each request
    })
    if (!response.ok) {
      throw new Error("Failed to fetch user data")
    }
    const data = await response.json()
    return data as User
  } catch (err) {
    console.error(err)
    redirect("/login") // Or handle error differently, e.g., show error page
  }
}

async function logoutAction() {
  "use server"
  const token = cookies().get("jwtToken")?.value
  if (token) {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
  }
  cookies().delete("jwtToken")
  redirect("/login")
}

export default async function HomePage() {
  const user = await getUser()

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" sx={{ color: "#ffffff" }}>
          Welcome, {user.name}
        </Typography>
        <form action={logoutAction}>
          <Button type="submit" variant="outlined" color="error">
            Logout
          </Button>
        </form>
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
