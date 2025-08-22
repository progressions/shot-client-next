import { Typography, Container, Box, Grid, Card, CardContent, Chip } from "@mui/material"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us - Chi War",
  description: "Learn about Chi War, the comprehensive campaign management system for Feng Shui 2 RPG adventures.",
  openGraph: {
    title: "About Us - Chi War",
    description: "Learn about Chi War, the comprehensive campaign management system for Feng Shui 2 RPG adventures.",
    type: "website",
  },
}

export default function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          About Chi War
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: "auto" }}>
          The ultimate campaign management system for Feng Shui 2 RPG adventures
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h4" component="h2" gutterBottom>
                Our Mission
              </Typography>
              <Typography paragraph>
                Chi War was created to streamline and enhance the Feng Shui 2 RPG experience for both players and gamemasters. 
                We believe that managing complex campaigns should be intuitive and engaging, not a burden.
              </Typography>
              <Typography paragraph>
                Our platform provides comprehensive tools for character management, campaign organization, 
                and real-time combat encounters, allowing you to focus on what matters most: 
                creating memorable stories and epic adventures.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h4" component="h2" gutterBottom>
                Key Features
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                <Chip label="Character Management" variant="outlined" />
                <Chip label="Campaign Organization" variant="outlined" />
                <Chip label="Real-time Combat" variant="outlined" />
                <Chip label="Discord Integration" variant="outlined" />
                <Chip label="AI Character Generation" variant="outlined" />
                <Chip label="Notion Sync" variant="outlined" />
              </Box>
              <Typography>
                From character creation and management to complex fight sequences and campaign tracking, 
                Chi War provides all the tools you need to run smooth, engaging Feng Shui 2 sessions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: "center" }}>
          About Feng Shui 2
        </Typography>
        <Typography paragraph sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
          Feng Shui 2, created by Robin D. Laws and Greg Stolze, is an action-packed RPG that lets you play 
          action movie heroes fighting across different time periods called junctures. Whether you&apos;re a 
          cop in contemporary Hong Kong, a sorcerer in ancient China, or a cyborg in the dystopian future, 
          Feng Shui 2 delivers cinematic action and memorable characters.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Open Source
              </Typography>
              <Typography>
                Chi War is built as an open source project, welcoming contributions from the community 
                to make it even better for Feng Shui 2 enthusiasts everywhere.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Modern Technology
              </Typography>
              <Typography>
                Built with Next.js 15, Ruby on Rails 8, and real-time WebSocket connections to provide 
                a fast, responsive, and reliable experience for your gaming sessions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Community Driven
              </Typography>
              <Typography>
                Created by gamers for gamers, Chi War evolves based on real player and gamemaster feedback 
                to address the actual needs of Feng Shui 2 campaigns.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}