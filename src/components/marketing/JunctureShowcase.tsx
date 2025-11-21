"use client"

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import Image from "next/image"
import { MARKETING_IMAGES } from "@/lib/marketingImages"

const JunctureSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  background: `linear-gradient(180deg, 
    ${theme.palette.background.default} 0%, 
    ${theme.palette.primary.main}08 50%, 
    ${theme.palette.background.default} 100%)`,
}))

const JunctureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[12],
  },
}))

const JunctureContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
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
        <Stack spacing={6}>
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Adventure Across Time
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: "auto" }}
            >
              Experience epic storytelling across four distinct time periods,
              each with its own flavor, challenges, and cinematic possibilities.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {junctures.map((juncture, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <JunctureCard>
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
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
                        display: "flex",
                        alignItems: "flex-end",
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="h4"
                        component="h3"
                        fontWeight="bold"
                        color="white"
                        sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
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
                        color="primary.main"
                      >
                        {juncture.title}
                      </Typography>

                      <Typography variant="body1" color="text.secondary">
                        {juncture.description}
                      </Typography>

                      <Box>
                        <Typography
                          variant="body2"
                          fontStyle="italic"
                          color="text.secondary"
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
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </JunctureContent>
                </JunctureCard>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Seamless Time-Hopping Adventures
            </Typography>
            <Typography variant="body1" color="text.secondary">
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
