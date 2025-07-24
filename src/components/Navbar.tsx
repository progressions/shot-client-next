import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Box, AppBar, Toolbar, Typography, Button, Avatar } from "@mui/material"
import Link from "next/link"
import { User } from "@/types/types"
import Client from "@/lib/Client"

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value
  if (!token) {
    return null
  }
  const client = new Client({ jwt: token })
  try {
    const data = await client.getCurrentUser()
    console.log("data", data)
    if (!data) {
      return null
    }
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
  if (!token) {
    return null
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
          Chi War
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
