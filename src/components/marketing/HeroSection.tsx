"use client"

import {
  Box,
  Button,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { styled, alpha } from "@mui/material/styles"
import Link from "next/link"
import Image from "next/image"
import { Login, ArrowForward } from "@mui/icons-material"
import { MARKETING_IMAGES } from "@/lib/marketingImages"

const HeroContainer = styled(Box)(() => ({
  color: "white",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
}))

const GlassCard = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  padding: theme.spacing(6, 8),
  maxWidth: "1000px",
  width: "90%",
  // Fully transparent - no glass effect
  background: "transparent",
  backdropFilter: "none",
  borderRadius: theme.spacing(4),
  border: "none",
  boxShadow: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(4),
    width: "95%",
  },
}))

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  letterSpacing: "-0.02em",
  marginBottom: theme.spacing(2),
  color: "#fff",
  // Stronger text shadow for contrast against raw image
  textShadow: "0 4px 12px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)",
  [theme.breakpoints.down("md")]: {
    fontSize: "2.5rem",
  },
}))

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  color: "#fff",
  fontSize: "1.25rem",
  lineHeight: 1.6,
  maxWidth: "700px",
  // Strong text shadow
  textShadow: "0 2px 8px rgba(0,0,0,0.9)",
  [theme.breakpoints.down("md")]: {
    fontSize: "1.1rem",
  },
}))

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.8, 4),
  fontSize: "1.1rem",
  fontWeight: 600,
  borderRadius: "50px",
  textTransform: "none",
  boxShadow: "0 4px 14px 0 rgba(0,0,0,0.3)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
  },
}))

const PrimaryCTA = styled(ActionButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.secondary.contrastText,
  border: "1px solid rgba(255,255,255,0.2)",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
  },
}))

const SecondaryCTA = styled(ActionButton)(({ theme }) => ({
  background: "rgba(0,0,0,0.6)", // Darker background for contrast
  color: "white",
  border: `2px solid ${alpha("#fff", 0.5)}`,
  "&:hover": {
    background: alpha("#000", 0.8),
    border: `2px solid ${theme.palette.secondary.main}`,
  },
}))

export function HeroSection() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <HeroContainer>
      {/* Background Image */}
      <Image
        src={MARKETING_IMAGES.assets.campaign}
        alt="Epic campaign background"
        fill
        style={{ objectFit: "cover" }}
        priority
        quality={90}
        unoptimized
      />

      <GlassCard>
        <HeroTitle variant="h1" component="h1">
          Master Epic Cinematic Adventures
        </HeroTitle>

        <HeroSubtitle variant="h5" component="h2">
          The ultimate Feng Shui 2 campaign management platform. Real-time
          combat, AI character generation, and cross-juncture storytelling
          await.
        </HeroSubtitle>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <Link
            href="/register"
            passHref
            style={{
              textDecoration: "none",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <PrimaryCTA
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              fullWidth={isMobile}
            >
              Start Your Legendary Campaign
            </PrimaryCTA>
          </Link>

          <Link
            href="/login"
            passHref
            style={{
              textDecoration: "none",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <SecondaryCTA
              variant="outlined"
              size="large"
              startIcon={<Login />}
              fullWidth={isMobile}
            >
              Already a Hero? Login
            </SecondaryCTA>
          </Link>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            mt: 4,
            opacity: 1,
            maxWidth: 500,
            fontSize: "0.875rem",
            color: "#fff",
            textShadow: "0 2px 4px rgba(0,0,0,0.9)",
          }}
        >
          Join gamemasters and players worldwide in creating unforgettable
          action movie adventures across the four junctures of time.
        </Typography>
      </GlassCard>
    </HeroContainer>
  )
}
