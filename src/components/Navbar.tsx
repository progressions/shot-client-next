"use client"

import { useRouter } from "next/navigation"
import { Box, AppBar, Toolbar, Typography, Avatar } from "@mui/material"
import Link from "next/link"
import { useClient } from "@/contexts"
import { logoutAction } from "@/lib/actions"
import { UserActions } from "@/reducers"
import { Button } from "@/components/ui"

export default function Navbar() {
  const { jwt, user, dispatchCurrentUser } = useClient()
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAction(jwt)
    dispatchCurrentUser({ type: UserActions.RESET })
    router.push("/login")
  }

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
          {user.id ? (
            <>
              <Avatar src={user.image_url ?? undefined} alt={user.name} sx={{ width: 32, height: 32 }} />
              <Button variant="outlined" color="error" onClick={handleLogout}>
                Logout
              </Button>
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
