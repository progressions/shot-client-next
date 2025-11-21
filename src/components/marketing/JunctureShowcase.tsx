"use client"

import { Box, Container, Typography, Grid, Stack, Chip } from "@mui/material"
import { styled, alpha } from "@mui/material/styles"
import Image from "next/image"
import { MARKETING_IMAGES } from "@/lib/marketingImages"

const JunctureSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 0),
  background: "#0f172a", // Dark slate
  position: "relative",
}))

const GlassJunctureCard = styled(Box)(({ theme }) => ({
  height: "100%",
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.spacing(3),
  background: alpha("#1e293b", 0.4),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha("#fff", 0.05)}`,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 20px 40px -5px ${alpha("#000", 0.4)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}))

const JunctureContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
}))

const junctures = [
  {
    id: "ancient",
    era: "Ancient China (690 AD)",
    title: "Mystical Powers Awaken",
    description:
      "Master ancient chi arts during the Tang Dynasty under Wu Zetian. Dragons soar, sorcerers weave spells, and legends are born in temples hidden from mortal eyes.",
    imageUrl: MARKETING_IMAGES.junctures.ancient,
    features: [
      "Supernatural chi powers",
      "Mystical creatures",
      "Ancient temples",
      "Martial arts mastery",
    ],
    atmosphere:
      "Golden temples, swirling mists, and the whisper of ancient secrets",
  },
  {
    id: "past",
    era: "Past (1850s)",
    title: "Way of the Shaolin",
    description:
      "Enter a world dominated by austere Shaolin monks and legendary martial artists. Ancient traditions clash with encroaching modernity as kung fu masters defend sacred temples and timeless wisdom.",
    imageUrl: MARKETING_IMAGES.junctures.past,
    features: [
      "Shaolin temples",
      "Martial arts schools",
      "Traditional kung fu",
      "Monastic discipline",
    ],
    atmosphere:
      "Mountain monasteries, training courtyards, and the pursuit of perfection",
  },
  {
    id: "modern",
    era: "Modern (Present Day)",
    title: "Modern Action Heroes",
    description:
      "Experience high-octane modern adventures with cutting-edge technology. From corporate espionage to street racing, bring action movie excitement to the present day.",
    imageUrl: MARKETING_IMAGES.junctures.modern,
    features: [
      "Modern weapons",
      "Urban environments",
      "High technology",
      "Global conspiracies",
    ],
    atmosphere: "Neon lights, high-speed chases, and explosive confrontations",
  },
  {
    id: "future",
    era: "Future (2056 AD)",
    title: "Simian Revolution",
    description:
      "Join The Jammers and the New Simian Army in their rebellion. Genetically-enhanced cyber-apes and human rebels battle for dominance in a world where technology and primal fury collide.",
    imageUrl: MARKETING_IMAGES.junctures.future,
    features: [
      "Cyber-apes",
      "Genetic enhancement",
      "Rebel warfare",
      "Primal technology",
    ],
    atmosphere:
      "Post-apocalyptic cityscapes, cyber-simian armies, and revolutionary chaos",
  },
]

export function JunctureShowcase() {
  return (
    <JunctureSection>
      <Container maxWidth="lg">
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
              Adventure Across Time
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
              Experience epic storytelling across four distinct time periods,
              each with its own flavor, challenges, and cinematic possibilities.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {junctures.map((juncture, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <GlassJunctureCard>
                  <Box position="relative" sx={{ aspectRatio: "16/9" }}>
                    <Image
                      src={juncture.imageUrl}
                      alt={juncture.title}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized // Since we're using external CDN
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(15,23,42,0.9))",
                        display: "flex",
                        alignItems: "flex-end",
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="h4"
                        component="h3"
                        fontWeight="bold"
                        sx={{
                          color: "#fff",
                          textShadow: "0 4px 12px rgba(0,0,0,0.5)",
                        }}
                      >
                        {juncture.era}
                      </Typography>
                    </Box>
                  </Box>

                  <JunctureContent>
                    <Stack spacing={2}>
                      <Typography
                        variant="h5"
                        component="h3"
                        fontWeight="bold"
                        sx={{ color: "#fff" }}
                      >
                        {juncture.title}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        {juncture.description}
                      </Typography>

                      <Box>
                        <Typography
                          variant="body2"
                          fontStyle="italic"
                          sx={{ color: "rgba(255,255,255,0.4)" }}
                          gutterBottom
                        >
                          Atmosphere: {juncture.atmosphere}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {juncture.features.map((feature, featureIndex) => (
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
                    </Stack>
                  </JunctureContent>
                </GlassJunctureCard>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
              Seamless Time-Hopping Adventures
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.5)" }}>
              Characters can travel between junctures, bringing ancient wisdom
              to future battles or modern technology to historical conflicts.
              The possibilities are endless.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </JunctureSection>
  )
}
