"use client"

import { Box, Button, Container, Typography, Stack } from "@mui/material"
import { styled } from "@mui/material/styles"
import Link from "next/link"
import Image from "next/image"
import { RocketLaunch, Login } from "@mui/icons-material"
import { MARKETING_IMAGES } from "@/lib/marketingImages"

const HeroContainer = styled(Box)(() => ({
  color: "white",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
}))

const HeroContent = styled(Container)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  textAlign: "center",
  [theme.breakpoints.up("md")]: {
    textAlign: "left",
  },
}))

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  [theme.breakpoints.down("md")]: {
    fontSize: "2.5rem",
  },
}))

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  opacity: 0.9,
  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
  [theme.breakpoints.down("md")]: {
    fontSize: "1.1rem",
  },
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

export function HeroSection() {
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
        unoptimized // Using external CDN
      />

      {/* Dark Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7))",
          zIndex: 1,
        }}
      />
      <HeroContent maxWidth="lg">
        <Stack spacing={4} alignItems={{ xs: "center", md: "flex-start" }}>
          <HeroTitle variant="h1" component="h1">
            Master Epic Cinematic Adventures
          </HeroTitle>

          <HeroSubtitle variant="h5" component="h2">
            The ultimate Feng Shui 2 campaign management platform.
            <br />
            Real-time combat, AI character generation, and cross-juncture
            storytelling await.
          </HeroSubtitle>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
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

          <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600 }}>
            Join gamemasters and players worldwide in creating unforgettable
            action movie adventures across the four junctures of time.
          </Typography>
        </Stack>
      </HeroContent>
    </HeroContainer>
  )
}
