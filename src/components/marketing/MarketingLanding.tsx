"use client"

import { Box } from "@mui/material"
import {
  HeroSection,
  FeatureShowcase,
  ScreenshotGallery,
  JunctureShowcase,
  CallToAction,
} from "."
import { Footer } from "@/components/ui"

export function MarketingLanding() {
  return (
    <Box sx={{ overflow: "hidden" }}>
      <HeroSection />
      <FeatureShowcase />
      <ScreenshotGallery />
      <JunctureShowcase />
      <CallToAction />
      <Footer />
    </Box>
  )
}
