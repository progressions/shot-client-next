"use client"

import { Box, Typography, Button } from "@mui/material"
import Link from "next/link"
import { Icon } from "@/components/ui"

export default function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        textAlign: "center",
        p: 4,
      }}
    >
      <Icon keyword="Adventures" size="64" />
      <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
        Adventure Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        The adventure you are looking for does not exist or has been removed.
      </Typography>
      <Button variant="contained" component={Link} href="/adventures">
        Back to Adventures
      </Button>
    </Box>
  )
}
