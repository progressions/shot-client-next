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
  Rating,
  Chip,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { FormatQuote } from "@mui/icons-material"

const TestimonialsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.background.default,
}))

const TestimonialCard = styled(Card)(({ theme }) => ({
  height: "100%",
  position: "relative",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}))

const QuoteIcon = styled(FormatQuote)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  fontSize: 32,
  color: theme.palette.primary.main,
  opacity: 0.3,
}))

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Gamemaster",
    campaign: "Shadow Warriors of Hong Kong",
    avatar: "SC",
    rating: 5,
    quote:
      "Chi War transformed how I run Feng Shui 2 games. The real-time combat tracking keeps everyone engaged, and the AI character generation saves me hours of prep time. My players love the cinematic feel!",
    highlight: "Real-time combat excellence",
  },
  {
    name: "Marcus Rodriguez",
    role: "Player & GM",
    campaign: "Temporal Guardians",
    avatar: "MR",
    rating: 5,
    quote:
      "The cross-juncture character management is brilliant. I can seamlessly move my cyber-enhanced monk from 2056 back to Ancient China. The storytelling possibilities are endless.",
    highlight: "Cross-time storytelling",
  },
  {
    name: "Elena Volkov",
    role: "Professional GM",
    campaign: "Corporate Shadows",
    avatar: "EV",
    rating: 5,
    quote:
      "As someone who runs multiple Feng Shui 2 campaigns professionally, Chi War's organization tools are invaluable. Campaign management, Discord integration, and player coordination all in one place.",
    highlight: "Professional-grade tools",
  },
  {
    name: "David Park",
    role: "Player",
    campaign: "Dragon's Revenge",
    avatar: "DP",
    rating: 5,
    quote:
      "The character sheet interface captures the cinematic spirit perfectly. Creating my Shaolin detective felt like directing my own action movie. The AI suggestions were spot-on!",
    highlight: "Cinematic character creation",
  },
]

const stats = [
  { number: "500+", label: "Active Campaigns" },
  { number: "2,000+", label: "Characters Created" },
  { number: "10,000+", label: "Combat Encounters" },
  { number: "50+", label: "Gaming Groups" },
]

export function TestimonialsSection() {
  return (
    <TestimonialsContainer>
      <Container maxWidth="lg">
        <Stack spacing={8}>
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Trusted by Gamemasters Worldwide
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: "auto" }}
            >
              Join a growing community of storytellers bringing cinematic
              adventures to life
            </Typography>
          </Box>

          {/* Statistics */}
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box textAlign="center">
                  <Typography
                    variant="h3"
                    component="div"
                    fontWeight="bold"
                    color="primary.main"
                    gutterBottom
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Testimonials */}
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <TestimonialCard>
                  <QuoteIcon />
                  <CardContent>
                    <Stack spacing={3}>
                      <Box>
                        <Rating
                          value={testimonial.rating}
                          readOnly
                          size="small"
                        />
                      </Box>

                      <Typography
                        variant="body1"
                        sx={{ fontStyle: "italic", lineHeight: 1.6 }}
                      >
                        &ldquo;{testimonial.quote}&rdquo;
                      </Typography>

                      <Box>
                        <Chip
                          label={testimonial.highlight}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role} • {testimonial.campaign}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </TestimonialCard>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center">
            <Typography variant="h6" color="primary.main" gutterBottom>
              Ready to Create Your Own Epic Adventures?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join thousands of gamemasters and players already using Chi War to
              run unforgettable Feng Shui 2 campaigns.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </TestimonialsContainer>
  )
}
