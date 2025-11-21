"use client"

import { Box, Container, Typography, Grid, Stack } from "@mui/material"
import { styled, alpha } from "@mui/material/styles"
import {
  FlashOn,
  Timeline,
  SmartToy,
  Groups,
  AutoAwesome,
  SportsKabaddi,
} from "@mui/icons-material"

const FeatureSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 0),
  background: "#0f172a", // Dark slate background
  position: "relative",
  overflow: "hidden",
}))

// Background glow effect
const Glow = styled(Box)(() => ({
  position: "absolute",
  width: "600px",
  height: "600px",
  background:
    "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
  borderRadius: "50%",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 0,
}))

const GlassCard = styled(Box)(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(4),
  background: alpha("#1e293b", 0.5),
  backdropFilter: "blur(12px)",
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha("#fff", 0.05)}`,
  transition: "all 0.3s ease-in-out",
  position: "relative",
  zIndex: 1,
  "&:hover": {
    transform: "translateY(-5px)",
    background: alpha("#1e293b", 0.8),
    boxShadow: `0 10px 30px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.dark, 0.4)} 100%)`,
  color: theme.palette.primary.light,
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}))

const FeatureTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1.5),
  color: "#fff",
}))

const features = [
  {
    icon: <FlashOn sx={{ fontSize: 28 }} />,
    title: "Master the Art of Cinematic Combat",
    description:
      "Real-time initiative tracking brings Hong Kong action movie excitement to your table. Manage complex fights with dynamic shot counters and dramatic timing.",
    highlight: "Lightning-fast combat resolution",
  },
  {
    icon: <Timeline sx={{ fontSize: 28 }} />,
    title: "Forge Legends Across Time",
    description:
      "Create and manage characters across four distinct junctures: Ancient China, Colonial Hong Kong, Contemporary times, and the Cyberpunk future.",
    highlight: "Cross-juncture character development",
  },
  {
    icon: <SmartToy sx={{ fontSize: 28 }} />,
    title: "AI-Powered Character Creation",
    description:
      "Generate compelling characters instantly with AI assistance. From mysterious Shaolin monks to cybernetic street samurai, bring your vision to life.",
    highlight: "Intelligent character generation",
  },
  {
    icon: <Groups sx={{ fontSize: 28 }} />,
    title: "Command Epic Encounters",
    description:
      "Orchestrate massive battles with multiple factions, vehicles, and named characters. Keep track of complex relationships and allegiances.",
    highlight: "Dynamic encounter management",
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 28 }} />,
    title: "Unleash Ancient Powers",
    description:
      "Manage supernatural abilities, martial arts schticks, and cutting-edge technology. Balance mystical chi powers with modern weaponry.",
    highlight: "Supernatural ability tracking",
  },
  {
    icon: <SportsKabaddi sx={{ fontSize: 28 }} />,
    title: "Rally Your Heroes",
    description:
      "Coordinate parties, factions, and allies across multiple campaigns. Discord integration keeps your team connected for remote sessions.",
    highlight: "Collaborative storytelling tools",
  },
]

export function FeatureShowcase() {
  return (
    <FeatureSection>
      <Glow />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={8} alignItems="center">
          <Box textAlign="center" maxWidth="800px">
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
              Cinematic Adventures Await
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Everything you need to run epic Feng Shui 2 campaigns with the
              flair and excitement of Hong Kong action cinema.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <GlassCard>
                  <IconWrapper>{feature.icon}</IconWrapper>

                  <FeatureTitle variant="h5" component="h3">
                    {feature.title}
                  </FeatureTitle>

                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      mb: 3,
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>

                  <Box
                    sx={{
                      display: "inline-block",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "6px",
                      background: alpha("#38bdf8", 0.1), // Light blue tint
                      border: `1px solid ${alpha("#38bdf8", 0.2)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{ color: "#38bdf8", letterSpacing: "0.5px" }}
                    >
                      {feature.highlight.toUpperCase()}
                    </Typography>
                  </Box>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </FeatureSection>
  )
}
