import { Box, Container, Typography } from "@mui/material"
import { InfoLink } from "@/components/ui"

export default function NotFound() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ bgcolor: "#424242", p: 2, borderRadius: 1 }}>
        <Typography variant="h4" sx={{ color: "#ffffff", mb: 2 }}>
          Character Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: "#ffffff" }}>
          The <InfoLink href="/characters" info="Character" /> you’re looking
          for does not exist or is not accessible.
        </Typography>
      </Box>
    </Container>
  )
}
