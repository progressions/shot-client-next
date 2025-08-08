import { Box, Container, Typography } from "@mui/material"

export default function ErrorPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ bgcolor: "#424242", p: 2, borderRadius: 1 }}>
        <Typography variant="h4" sx={{ color: "#ffffff", mb: 2 }}>
          Oops!
        </Typography>
        <Typography variant="body1" sx={{ color: "#ffffff" }}>
          The page you’re looking for does not exist or is not accessible.
        </Typography>
      </Box>
    </Container>
  )
}
