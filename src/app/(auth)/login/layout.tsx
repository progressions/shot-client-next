import { ReactNode } from "react"
import { Box } from "@mui/material"

export const metadata = {
  title: "Login - Chi War",
  description: "Log in to Chi War to access your account"
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {children}
    </Box>
  )
}
