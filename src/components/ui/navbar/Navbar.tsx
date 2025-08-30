import { Box, AppBar, Toolbar, Typography } from "@mui/material"
import Link from "next/link"
import { Button } from "../Button"
import { ConditionalMenu } from "./ConditionalMenu"
import { UserMenu } from "./UserMenu"

export async function Navbar({ user }) {
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
          <ConditionalMenu />
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
            <UserMenu user={user} />
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
