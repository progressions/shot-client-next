"use client"

import React from "react"
import { Box, Typography, Button, Stack, Chip } from "@mui/material"
import { Celebration, Check, Close } from "@mui/icons-material"
import { useToast } from "@/contexts"

export const CongratulationsModule: React.FC = () => {
  const { toastSuccess, toastError } = useToast()

  const handleDismiss = async () => {
    try {
      // TODO: Implement dismiss functionality
      toastSuccess("Congratulations dismissed! You're all set to play!")
      // The page will re-render automatically as the user data updates
    } catch (error) {
      console.error("Failed to dismiss congratulations:", error)
      toastError("Failed to dismiss congratulations. Please try again.")
    }
  }

  return (
    <Box sx={{ textAlign: "center" }}>
      {/* Celebration animation */}
      <Box sx={{ mb: 3, position: "relative" }}>
        <Box
          sx={{
            display: "inline-flex",
            p: 3,
            borderRadius: "50%",
            backgroundColor: "success.main",
            color: "white",
            mb: 2,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              border: "3px solid",
              borderColor: "success.200",
              borderRadius: "50%",
              animation: "pulse 2s infinite",
            },
            "@keyframes pulse": {
              "0%": {
                transform: "scale(1)",
                opacity: 1,
              },
              "50%": {
                transform: "scale(1.1)",
                opacity: 0.7,
              },
              "100%": {
                transform: "scale(1)",
                opacity: 1,
              },
            },
          }}
        >
          <Celebration sx={{ fontSize: 48 }} />
        </Box>

        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: 700, color: "success.main", mb: 1 }}
        >
          🎉 Congratulations! 🎉
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          You've successfully set up your world!
        </Typography>
      </Box>

      {/* Achievement summary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          You've mastered the basics of Chi War by creating your first campaign,
          characters, factions, fights, parties, and sites. You're now ready to
          dive into epic adventures!
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          flexWrap="wrap"
          sx={{ mb: 3 }}
        >
          {["Campaign", "Character", "Faction", "Fight", "Party", "Site"].map(
            item => (
              <Chip
                key={item}
                icon={<Check />}
                label={item}
                color="success"
                variant="filled"
                size="small"
              />
            )
          )}
        </Stack>
      </Box>

      {/* What's next */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "info.50",
          border: "1px solid",
          borderColor: "info.200",
          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 2, color: "info.main" }}
        >
          🚀 What's Next?
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "left" }}
        >
          • <strong>Create more characters:</strong> Build your cast of heroes
          and villains
          <br />• <strong>Start fights:</strong> Use the initiative system to
          run combat encounters
          <br />• <strong>Organize parties:</strong> Group characters for
          adventures and missions
          <br />• <strong>Build your world:</strong> Add more factions, sites,
          and campaign details
          <br />• <strong>Have fun:</strong> You're ready to play Feng Shui 2!
        </Typography>
      </Box>

      {/* Dismiss button */}
      <Button
        variant="contained"
        size="large"
        endIcon={<Close />}
        onClick={handleDismiss}
        sx={{
          px: 4,
          py: 1.5,
          fontWeight: 600,
          textTransform: "none",
          fontSize: "1.1rem",
          backgroundColor: "success.main",
          "&:hover": {
            backgroundColor: "success.dark",
          },
        }}
      >
        Got it! Let's Play!
      </Button>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2, fontStyle: "italic" }}
      >
        (This message won't appear again)
      </Typography>
    </Box>
  )
}
