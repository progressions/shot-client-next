import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Box, AppBar, Toolbar, Typography, Button, Avatar } from "@mui/material"
import Link from "next/link"
import { User } from "@/types/types"

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value
  if (!token) {
    return null
  }
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/current`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    })
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data as User
  } catch (err) {
    console.error(err)
    return null
  }
}

async function logoutAction() {
  "use server"
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value
  if (token) {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
  }
  cookieStore.delete("jwtToken")
  redirect("/login")
}

export default async function Navbar() {
  const user = await getUser()

  return (
    <AppBar position="static" sx={{ bgcolor: "#1d1d1d" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ color: "#ffffff", textDecoration: "none" }}
        >
          Shot Counter
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user ? (
            <>
              <Avatar src={user.image_url ?? undefined} alt={user.name} sx={{ width: 32, height: 32 }} />
              <form action={logoutAction}>
                <Button type="submit" variant="outlined" color="error">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/login"
              sx={{ color: "#ffffff" }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
