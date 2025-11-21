"use client"

import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { styled, alpha } from "@mui/material/styles"
import Link from "next/link"
import Image from "next/image"
import {
  RocketLaunch,
  Login,
  MenuBook,
  ArrowForward,
} from "@mui/icons-material"
import { MARKETING_IMAGES } from "@/lib/marketingImages"

const SectionWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  minHeight: "850px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  padding: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    minHeight: "auto",
  },
}))

const GlassCard = styled(Paper)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  padding: theme.spacing(6, 8),
  maxWidth: "900px",
  width: "100%",
  // Fully transparent - no glass effect
  background: "transparent",
  backdropFilter: "none",
  borderRadius: theme.spacing(3),
  border: "none",
  boxShadow: "none",
  color: "white",
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(4),
  },
}))

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: "1.1rem",
  fontWeight: 600,
  borderRadius: "50px", // Pill shape
  textTransform: "none",
  boxShadow: "0 4px 14px 0 rgba(0,0,0,0.3)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
  },
}))

const PrimaryButton = styled(ActionButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.secondary.contrastText,
  border: "1px solid rgba(255,255,255,0.2)",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
  },
}))

const SecondaryButton = styled(ActionButton)(({ theme }) => ({
  background: "rgba(0,0,0,0.6)",
  color: "white",
  border: `2px solid ${alpha("#fff", 0.5)}`,
  "&:hover": {
    background: alpha("#000", 0.8),
    border: `2px solid ${theme.palette.secondary.main}`,
  },
}))

const quickFeatures = [
  {
    icon: <RocketLaunch sx={{ fontSize: 32, color: "secondary.main" }} />,
    title: "Quick Setup",
    description: "Create your first campaign in under 5 minutes",
  },
  {
    icon: <MenuBook sx={{ fontSize: 32, color: "secondary.main" }} />,
    title: "Learn Fast",
    description: "Comprehensive documentation and tutorials",
  },
]

export function CallToAction() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <SectionWrapper>
      {/* Background Image */}
      <Image
        src={MARKETING_IMAGES.assets.eatersOfTheLotus}
        alt="Eaters of the Lotus background"
        fill
        style={{ objectFit: "cover" }}
        quality={90}
        priority
        unoptimized // Using external CDN
      />

      <GlassCard elevation={0}>
        <Stack spacing={5} alignItems="center" textAlign="center">
          {/* Header Section */}
          <Box>
            <Typography
              variant={isMobile ? "h4" : "h2"}
              component="h2"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                mb: 2,
                color: "#fff",
                textShadow:
                  "0 4px 12px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)",
              }}
            >
              Your Epic Adventure Awaits
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
                fontWeight: 400,
                textShadow: "0 2px 8px rgba(0,0,0,0.9)",
              }}
            >
              The ultimate Feng Shui 2 campaign management platform. Real-time
              combat, AI character generation, and cross-juncture storytelling
              await.
            </Typography>
          </Box>

          <Divider flexItem sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

          {/* Features - Now inline/cleaner */}
          <Grid container spacing={4} justifyContent="center">
            {quickFeatures.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent={{ xs: "flex-start", sm: "center" }}
                  sx={{
                    p: 1,
                    textAlign: "left",
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      background: alpha(theme.palette.secondary.main, 0.2), // Increased visibility
                      display: "flex",
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
                      boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        mb: 0.5,
                        color: "#fff",
                        textShadow: "0 2px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.95)",
                        textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>

          {/* Main Actions */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            width="100%"
            justifyContent="center"
            sx={{ pt: 2 }}
          >
            <Link href="/register" passHref style={{ textDecoration: "none" }}>
              <PrimaryButton
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                fullWidth={isMobile}
              >
                Start Your Legendary Campaign
              </PrimaryButton>
            </Link>

            <Link href="/login" passHref style={{ textDecoration: "none" }}>
              <SecondaryButton
                variant="outlined"
                size="large"
                startIcon={<Login />}
                fullWidth={isMobile}
              >
                Already a Hero? Login
              </SecondaryButton>
            </Link>
          </Stack>

          {/* Footer Links */}
          <Stack
            spacing={2}
            alignItems="center"
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(255,255,255,0.2)",
              width: "100%",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 3 }}
              alignItems="center"
            >
              <Link href="/documentation" passHref>
                <Button
                  size="small"
                  sx={{
                    color: "#fff",
                    textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                    "&:hover": { color: "white", textDecoration: "underline" },
                  }}
                >
                  Explore Documentation
                </Button>
              </Link>

              {!isMobile && (
                <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                  •
                </Typography>
              )}

              <Link href="/support" passHref>
                <Button
                  size="small"
                  sx={{
                    color: "#fff",
                    textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                    "&:hover": { color: "white", textDecoration: "underline" },
                  }}
                >
                  Get Support
                </Button>
              </Link>

              {!isMobile && (
                <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                  •
                </Typography>
              )}

              <Link href="/about" passHref>
                <Button
                  size="small"
                  sx={{
                    color: "#fff",
                    textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                    "&:hover": { color: "white", textDecoration: "underline" },
                  }}
                >
                  Learn About Chi War
                </Button>
              </Link>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontStyle: "italic",
                fontSize: "0.85rem",
                textShadow: "0 1px 3px rgba(0,0,0,0.9)",
              }}
            >
              &ldquo;Master the Art of Cinematic Combat. Forge Legends Across
              Time.&rdquo;
            </Typography>
          </Stack>
        </Stack>
      </GlassCard>
    </SectionWrapper>
  )
}
