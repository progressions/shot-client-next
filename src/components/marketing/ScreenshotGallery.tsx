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
import Image from "next/image"
import { MARKETING_IMAGES } from "@/lib/marketingImages"

const GallerySection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.background.default 
    : theme.palette.grey[50],
}))

const ScreenshotCard = styled(Paper)(({ theme }) => ({
  overflow: "hidden",
  borderRadius: theme.spacing(2),
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[8],
  },
}))

const screenshots = [
  {
    imageUrl: MARKETING_IMAGES.screenshots.dashboard,
    title: "Campaign Dashboard",
    description: "Central command for managing your entire campaign",
    features: ["Real-time updates", "Quick navigation", "Campaign overview"],
  },
  {
    imageUrl: MARKETING_IMAGES.screenshots.characterSheet,
    title: "Character Sheet Interface",
    description: "Comprehensive character management with cinematic flair",
    features: ["Attribute tracking", "Schtick management", "Gear inventory"],
  },
  {
    imageUrl: MARKETING_IMAGES.screenshots.combat,
    title: "Live Combat Session",
    description: "Dynamic encounter management in real-time",
    features: ["Initiative tracking", "Action resolution", "Multi-participant"],
  },
  {
    imageUrl: MARKETING_IMAGES.screenshots.aiGeneration,
    title: "AI Character Generation",
    description: "Intelligent character creation with backstory generation",
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
                <ScreenshotCard elevation={3}>
                  <Box 
                    position="relative" 
                    sx={{ 
                      aspectRatio: "16/9",
                      backgroundColor: "background.paper",
                      overflow: "hidden"
                    }}
                  >
                    <Image
                      src={screenshot.imageUrl}
                      alt={screenshot.title}
                      fill
                      style={{ 
                        objectFit: "cover",
                        objectPosition: "center"
                      }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized // Using external CDN
                    />
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                    >
                      {screenshot.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {screenshot.description}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {screenshot.features.map((feature, featureIndex) => (
                        <Chip
                          key={featureIndex}
                          label={feature}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Stack>
                  </Box>
                </ScreenshotCard>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Experience the full power and elegance of the Chi War interface.
              <br />
              Where intuitive design meets Hong Kong action cinema aesthetics.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </GallerySection>
  )
}
