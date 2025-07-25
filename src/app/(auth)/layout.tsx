import { ReactNode } from "react"
import { Box } from "@mui/material"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {children}
    </Box>
  )
}
