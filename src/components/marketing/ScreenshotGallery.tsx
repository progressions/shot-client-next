"use client"

import { Box, Container, Typography, Stack, Chip } from "@mui/material"
import { styled, alpha } from "@mui/material/styles"
import Image from "next/image"
import { MARKETING_IMAGES } from "@/lib/marketingImages"

const GallerySection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 0),
  background: "#0f172a", // Dark slate
  position: "relative",
}))

const ScreenshotCard = styled(Box)(({ theme }) => ({
  overflow: "hidden",
  borderRadius: theme.spacing(3),
  background: alpha("#1e293b", 0.4),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha("#fff", 0.05)}`,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 20px 40px -5px ${alpha("#000", 0.4)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
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
      <Container maxWidth="xl">
        <Stack spacing={8}>
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 800,
                background: "linear-gradient(to right, #fff, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              See Chi War in Action
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 800,
                mx: "auto",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 400,
              }}
            >
              Explore the intuitive interface designed for cinematic
              storytelling and seamless campaign management.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 4,
            }}
          >
            {screenshots.map((screenshot, index) => (
              <ScreenshotCard key={index}>
                <Box
                  position="relative"
                  sx={{
                    aspectRatio: "16/9",
                    backgroundColor: "#000",
                    overflow: "hidden",
                    borderBottom: `1px solid ${alpha("#fff", 0.05)}`,
                  }}
                >
                  <Image
                    src={screenshot.imageUrl}
                    alt={screenshot.title}
                    fill
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 40%)",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 4,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    fontWeight="bold"
                    sx={{ color: "#fff" }}
                  >
                    {screenshot.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{ color: "rgba(255,255,255,0.6)", mb: 3, flexGrow: 1 }}
                  >
                    {screenshot.description}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {screenshot.features.map((feature, featureIndex) => (
                      <Chip
                        key={featureIndex}
                        label={feature}
                        size="small"
                        sx={{
                          background: alpha("#fff", 0.1),
                          color: "rgba(255,255,255,0.8)",
                          border: `1px solid ${alpha("#fff", 0.1)}`,
                          "&:hover": { background: alpha("#fff", 0.2) },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </ScreenshotCard>
            ))}
          </Box>

          <Box textAlign="center">
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.5)" }}>
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
