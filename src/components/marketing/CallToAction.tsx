"use client"

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import Link from "next/link"
import { RocketLaunch, Login, MenuBook } from "@mui/icons-material"

const CTASection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.primary.dark} 50%, 
    ${theme.palette.secondary.main} 100%)`,
  color: "white",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.2)",
    zIndex: 1,
  },
}))

const CTAContent = styled(Container)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  textAlign: "center",
}))

const CTAButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(2, 4),
  fontSize: "1.2rem",
  fontWeight: "bold",
  textTransform: "none",
  borderRadius: theme.spacing(1),
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4)",
  },
}))

const PrimaryCTA = styled(CTAButton)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.secondary.dark,
  },
}))

const SecondaryCTA = styled(CTAButton)(({ theme }) => ({
  backgroundColor: "transparent",
  color: "white",
  border: "2px solid white",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: theme.palette.secondary.main,
  },
}))

const FeatureHighlight = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: theme.spacing(2),
  color: "white",
  textAlign: "center",
  height: "100%",
}))

const quickFeatures = [
  {
    icon: <RocketLaunch sx={{ fontSize: 40 }} />,
    title: "Quick Setup",
    description: "Create your first campaign in under 5 minutes",
  },
  {
    icon: <MenuBook sx={{ fontSize: 40 }} />,
    title: "Learn Fast",
    description: "Comprehensive documentation and tutorials",
  },
]

export function CallToAction() {
  return (
    <CTASection>
      <CTAContent maxWidth="lg">
        <Stack spacing={6}>
          <Box>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                mb: 3,
              }}
            >
              Your Epic Adventure Awaits
            </Typography>

            <Typography
              variant="h5"
              sx={{
                opacity: 0.9,
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
                maxWidth: 800,
                mx: "auto",
                mb: 4,
              }}
            >
              Join thousands of storytellers creating unforgettable cinematic
              campaigns. Experience the power of professional-grade RPG
              management tools.
            </Typography>
          </Box>

          {/* Quick Features */}
          <Grid container spacing={3}>
            {quickFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FeatureHighlight elevation={0}>
                  <Stack spacing={2} alignItems="center">
                    <Box sx={{ color: "white" }}>{feature.icon}</Box>
                    <Typography variant="h6" fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {feature.description}
                    </Typography>
                  </Stack>
                </FeatureHighlight>
              </Grid>
            ))}
          </Grid>

          {/* Main CTAs */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <Link href="/register" passHref>
              <PrimaryCTA
                variant="contained"
                size="large"
                startIcon={<RocketLaunch />}
                fullWidth={{ xs: true, sm: false }}
              >
                Start Your Legendary Campaign
              </PrimaryCTA>
            </Link>

            <Link href="/login" passHref>
              <SecondaryCTA
                variant="outlined"
                size="large"
                startIcon={<Login />}
                fullWidth={{ xs: true, sm: false }}
              >
                Already a Hero? Login
              </SecondaryCTA>
            </Link>
          </Stack>

          {/* Secondary Actions */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Link href="/documentation" passHref>
              <Button
                color="inherit"
                sx={{ color: "white", textDecoration: "underline" }}
              >
                Explore Documentation
              </Button>
            </Link>

            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              •
            </Typography>

            <Link href="/support" passHref>
              <Button
                color="inherit"
                sx={{ color: "white", textDecoration: "underline" }}
              >
                Get Support
              </Button>
            </Link>

            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              •
            </Typography>

            <Link href="/about" passHref>
              <Button
                color="inherit"
                sx={{ color: "white", textDecoration: "underline" }}
              >
                Learn About Chi War
              </Button>
            </Link>
          </Stack>

          <Box>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.8,
                fontStyle: "italic",
              }}
            >
              &ldquo;Master the Art of Cinematic Combat. Forge Legends Across
              Time.&rdquo;
            </Typography>
          </Box>
        </Stack>
      </CTAContent>
    </CTASection>
  )
}
