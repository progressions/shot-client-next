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

const JunctureImagePlaceholder = styled(Box)<{ juncture: string }>(({
  juncture,
}) => {
  const backgrounds = {
    ancient: `linear-gradient(135deg, #d4af37 0%, #8b4513 100%)`,
    colonial: `linear-gradient(135deg, #4a5d23 0%, #8b4513 100%)`,
    contemporary: `linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)`,
    future: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
  }

  return {
    aspectRatio: "16/9",
    background:
      backgrounds[juncture as keyof typeof backgrounds] ||
      backgrounds.contemporary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.3)",
    },
  }
})

const JunctureContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
}))

const junctures = [
  {
    id: "ancient",
    era: "Ancient China (69 AD)",
    title: "Mystical Powers Awaken",
    description:
      "Master ancient chi arts in the birthplace of supernatural martial arts. Dragons soar, sorcerers weave spells, and legends are born in temples hidden from mortal eyes.",
    filename: "ancient-martial-arts.jpg",
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
    id: "colonial",
    era: "Colonial Hong Kong (1850s)",
    title: "East Meets West",
    description:
      "Navigate the clash of cultures in Victorian Hong Kong. Secret societies, opium wars, and colonial intrigue create the perfect backdrop for pulp adventure stories.",
    filename: "colonial-hongkong.jpg",
    features: [
      "Cultural conflict",
      "Secret societies",
      "Steam technology",
      "Political intrigue",
    ],
    atmosphere: "Gaslit streets, oriental mysteries, and the romance of empire",
  },
  {
    id: "contemporary",
    era: "Contemporary (Present Day)",
    title: "Modern Action Heroes",
    description:
      "Experience high-octane modern adventures with cutting-edge technology. From corporate espionage to street racing, bring action movie excitement to the present day.",
    filename: "contemporary-action.jpg",
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
    title: "Cyberpunk Dystopia",
    description:
      "Fight against the oppressive Buro in a world of cyber-enhanced warriors and corporate tyranny. Technology and magic collide in a neon-soaked dystopian future.",
    filename: "cyberpunk-future.jpg",
    features: [
      "Cybernetic enhancement",
      "Corporate warfare",
      "Technological magic",
      "Resistance fighters",
    ],
    atmosphere:
      "Cyber-enhanced reality, corporate megastructures, and digital rebellion",
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
              <Grid item xs={12} md={6} key={index}>
                <JunctureCard>
                  <JunctureImagePlaceholder juncture={juncture.id}>
                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 2,
                        textAlign: "center",
                        p: 2,
                      }}
                    >
                      <Typography
                        variant="h4"
                        component="h3"
                        fontWeight="bold"
                        gutterBottom
                      >
                        {juncture.era}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Image placeholder: {juncture.filename}
                      </Typography>
                    </Box>
                  </JunctureImagePlaceholder>

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
