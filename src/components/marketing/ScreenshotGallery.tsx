"use client"

import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  Dashboard,
  Person,
  SportsKabaddi,
  AutoAwesome,
} from "@mui/icons-material"

const GallerySection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.grey[50],
}))

const ScreenshotPlaceholder = styled(Paper)(({ theme }) => ({
  aspectRatio: "16/9",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.grey[200],
  border: `2px dashed ${theme.palette.grey[400]}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.grey[300],
    borderColor: theme.palette.primary.main,
    transform: "scale(1.02)",
  },
}))

const ScreenshotIcon = styled(Box)(({ theme }) => ({
  fontSize: 48,
  color: theme.palette.grey[600],
  marginBottom: theme.spacing(2),
}))

const ScreenshotTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(1),
  color: theme.palette.grey[800],
}))

const screenshots = [
  {
    icon: <Dashboard sx={{ fontSize: 48 }} />,
    title: "Campaign Dashboard",
    description: "Central command for managing your entire campaign",
    filename: "hero-dashboard.png",
    dimensions: "1920x1080",
    features: ["Real-time updates", "Quick navigation", "Campaign overview"],
  },
  {
    icon: <Person sx={{ fontSize: 48 }} />,
    title: "Character Sheet Interface",
    description: "Comprehensive character management with cinematic flair",
    filename: "character-sheet-demo.png",
    dimensions: "1920x1080",
    features: ["Attribute tracking", "Schtick management", "Gear inventory"],
  },
  {
    icon: <SportsKabaddi sx={{ fontSize: 48 }} />,
    title: "Live Combat Session",
    description: "Dynamic encounter management in real-time",
    filename: "combat-encounter.png",
    dimensions: "1920x1080",
    features: ["Initiative tracking", "Action resolution", "Multi-participant"],
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 48 }} />,
    title: "AI Character Generation",
    description: "Intelligent character creation with backstory generation",
    filename: "character-creation.png",
    dimensions: "1920x1080",
    features: ["AI assistance", "Visual generation", "Instant backstories"],
  },
]

export function ScreenshotGallery() {
  return (
    <GallerySection>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              See Chi War in Action
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: "auto" }}
            >
              Explore the intuitive interface designed for cinematic
              storytelling and seamless campaign management.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {screenshots.map((screenshot, index) => (
              <Grid item xs={12} md={6} key={index}>
                <ScreenshotPlaceholder elevation={0}>
                  <ScreenshotIcon>{screenshot.icon}</ScreenshotIcon>

                  <ScreenshotTitle variant="h6">
                    Screenshot: {screenshot.title}
                  </ScreenshotTitle>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 2 }}
                  >
                    {screenshot.description}
                  </Typography>

                  <Stack spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {screenshot.filename} • {screenshot.dimensions}{" "}
                      recommended
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      justifyContent="center"
                    >
                      {screenshot.features.map((feature, featureIndex) => (
                        <Chip
                          key={featureIndex}
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </ScreenshotPlaceholder>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Real screenshots will showcase the full power and elegance of the
              Chi War interface.
              <br />
              Experience intuitive design meets Hong Kong action cinema
              aesthetics.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </GallerySection>
  )
}
