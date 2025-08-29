"use client"

import { Box } from "@mui/material"
import {
  HeroSection,
  FeatureShowcase,
  ScreenshotGallery,
  JunctureShowcase,
  CallToAction,
} from "."

export function MarketingLanding() {
  return (
    <Box sx={{ overflow: "hidden" }}>
      <HeroSection />
      <FeatureShowcase />
      <ScreenshotGallery />
      <JunctureShowcase />
      <CallToAction />
    </Box>
  )
}
