"use client"

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  FlashOn,
  Timeline,
  SmartToy,
  Groups,
  AutoAwesome,
  SportsKabaddi,
} from "@mui/icons-material"

const FeatureSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.background.default,
}))

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(3),
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}))

const FeatureIcon = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}))

const FeatureTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}))

const features = [
  {
    icon: <FlashOn sx={{ fontSize: 32 }} />,
    title: "Master the Art of Cinematic Combat",
    description:
      "Real-time initiative tracking brings Hong Kong action movie excitement to your table. Manage complex fights with dynamic shot counters and dramatic timing.",
    highlight: "Lightning-fast combat resolution",
  },
  {
    icon: <Timeline sx={{ fontSize: 32 }} />,
    title: "Forge Legends Across Time",
    description:
      "Create and manage characters across four distinct junctures: Ancient China, Colonial Hong Kong, Contemporary times, and the Cyberpunk future.",
    highlight: "Cross-juncture character development",
  },
  {
    icon: <SmartToy sx={{ fontSize: 32 }} />,
    title: "AI-Powered Character Creation",
    description:
      "Generate compelling characters instantly with AI assistance. From mysterious Shaolin monks to cybernetic street samurai, bring your vision to life.",
    highlight: "Intelligent character generation",
  },
  {
    icon: <Groups sx={{ fontSize: 32 }} />,
    title: "Command Epic Encounters",
    description:
      "Orchestrate massive battles with multiple factions, vehicles, and named characters. Keep track of complex relationships and allegiances.",
    highlight: "Dynamic encounter management",
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 32 }} />,
    title: "Unleash Ancient Powers",
    description:
      "Manage supernatural abilities, martial arts schticks, and cutting-edge technology. Balance mystical chi powers with modern weaponry.",
    highlight: "Supernatural ability tracking",
  },
  {
    icon: <SportsKabaddi sx={{ fontSize: 32 }} />,
    title: "Rally Your Heroes",
    description:
      "Coordinate parties, factions, and allies across multiple campaigns. Discord integration keeps your team connected for remote sessions.",
    highlight: "Collaborative storytelling tools",
  },
]

export function FeatureShowcase() {
  return (
    <FeatureSection>
      <Container maxWidth="lg">
        <Stack spacing={6} alignItems="center">
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Cinematic Adventures Await
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: "auto" }}
            >
              Everything you need to run epic Feng Shui 2 campaigns with the
              flair and excitement of Hong Kong action cinema.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <FeatureCard>
                  <CardContent>
                    <Stack spacing={2}>
                      <FeatureIcon>{feature.icon}</FeatureIcon>

                      <FeatureTitle variant="h5" component="h3">
                        {feature.title}
                      </FeatureTitle>

                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>

                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: "primary.main",
                          color: "primary.contrastText",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {feature.highlight}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </FeatureSection>
  )
}
