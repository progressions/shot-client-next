import { Box, AppBar, Toolbar, Typography, Avatar } from "@mui/material"
import Link from "next/link"
import { getUser } from "@/lib/getServerClient"
import { logoutAction } from "@/lib/actions"
import { Button } from "@/components/ui"
import { MainMenu } from "@/components/ui/navbar"

export async function Navbar() {
  const user = await getUser()

  return (
    <AppBar position="static" sx={{ bgcolor: "#1d1d1d" }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 1, sm: 2 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <MainMenu />
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Chi War
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}
        >
          {user?.id ? (
            <>
              <Avatar
                src={user.image_url ?? undefined}
                alt={user.name}
                sx={{ width: 32, height: 32 }}
              />
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
