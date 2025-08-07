import { Box, Container, Typography } from "@mui/material"
import { InfoLink } from "@/components/ui"

export default function NotFound() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ bgcolor: "#424242", p: 2, borderRadius: 1 }}>
        <Typography variant="h4" sx={{ color: "#ffffff", mb: 2 }}>
          User Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: "#ffffff" }}>
          The <InfoLink href="/users" info="User" /> you’re looking for does not
          exist or is not accessible.
        </Typography>
      </Box>
    </Container>
  )
}
