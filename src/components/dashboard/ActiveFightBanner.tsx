"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Skeleton,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { FaFire, FaUsers, FaPlay, FaUser } from "react-icons/fa6"
import { useApp, useClient } from "@/contexts"
import type { Fight } from "@/types"

interface ActiveFightBannerProps {
  campaignId: string
  userId: string
  isGamemaster?: boolean
}

export default function ActiveFightBanner({
  campaignId,
  userId,
}: ActiveFightBannerProps) {
  const { subscribeToEntity } = useApp()
  const { client } = useClient()
  const [currentFight, setCurrentFight] = useState<Fight | null>(null)
  const [loading, setLoading] = useState(true)
  const [participantCount, setParticipantCount] = useState(0)

  // Find user's character in the fight (if any)
  const userCharacter = useMemo(() => {
    if (!currentFight?.characters || !userId) return null
    return currentFight.characters.find(char => char.user_id === userId) || null
  }, [currentFight?.characters, userId])

  const fetchCurrentFight = useCallback(async () => {
    if (!client) {
      console.log("Client not ready yet")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await client.getCurrentFight(campaignId)

      if (response.status === 204 || !response.data) {
        // No active fight
        setCurrentFight(null)
      } else {
        const fight = response.data
        setCurrentFight(fight)
        // Count participants (characters and vehicles in the fight)
        const characterCount = fight.characters?.length || 0
        const vehicleCount = fight.vehicles?.length || 0
        const totalCount = characterCount + vehicleCount
        setParticipantCount(totalCount)
      }
    } catch (error) {
      // Check if it's a 204 response (no content)
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 204
      ) {
        setCurrentFight(null)
      } else {
        console.error("Error fetching current fight:", error)
        setCurrentFight(null)
      }
    } finally {
      setLoading(false)
    }
  }, [campaignId, client])

  // Fetch current fight on mount and when campaign changes
  useEffect(() => {
    fetchCurrentFight()
  }, [fetchCurrentFight])

  // Subscribe to fight updates via subscribeToEntity instead of overwriting main subscription
  useEffect(() => {
    if (!subscribeToEntity) return

    const unsubscribeFights = subscribeToEntity(
      "fight",
      (updatedFight: Fight) => {
        if (
          updatedFight &&
          currentFight &&
          updatedFight.id === currentFight.id
        ) {
          // Update current fight data
          setCurrentFight(updatedFight)
        }
      }
    )

    const unsubscribeFightEvents = subscribeToEntity(
      "fights",
      (eventData: unknown) => {
        if (eventData === "reload") {
          // Fights reloaded, refresh current fight
          fetchCurrentFight()
        } else if (eventData && typeof eventData === "object") {
          const eventObj = eventData as { type?: string; fight_id?: string }
          if (
            eventObj.type === "fight_ended" &&
            eventObj.fight_id === currentFight?.id
          ) {
            // Fight has ended, clear the banner
            setCurrentFight(null)
          } else if (eventObj.type === "fight_started") {
            // New fight started, fetch it
            fetchCurrentFight()
          }
        }
      }
    )

    return () => {
      unsubscribeFights()
      unsubscribeFightEvents()
    }
  }, [subscribeToEntity, currentFight?.id, fetchCurrentFight, currentFight])

  // Don't render anything if no fight is active
  if (!loading && !currentFight) {
    return null
  }

  return (
    <AnimatePresence>
      {(loading || currentFight) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={3}
            sx={{
              mb: 3,
              p: 2,
              background: currentFight?.image_url
                ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('${currentFight.image_url}')`
                : "#d32f2f",
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              {loading ? (
                <Stack spacing={1}>
                  <Skeleton
                    variant="text"
                    width={300}
                    height={40}
                    sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}
                  />
                  <Skeleton
                    variant="text"
                    width={200}
                    height={24}
                    sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}
                  />
                </Stack>
              ) : (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                    >
                      <FaFire size={24} />
                      <Typography variant="h5" fontWeight="bold">
                        Active Fight: {currentFight?.name}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        label={`Sequence ${currentFight?.sequence || 1}`}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255, 255, 255, 0.2)",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <FaUsers size={16} />
                        <Typography variant="body2">
                          {participantCount} participants in combat
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    {userCharacter && currentFight && (
                      <Button
                        component={Link}
                        href={`/encounters/${currentFight.id}/play/${userCharacter.id}`}
                        target="_blank"
                        variant="contained"
                        size="large"
                        startIcon={<FaUser />}
                        sx={{
                          bgcolor: "white",
                          color: "#ff6b6b",
                          fontWeight: "bold",
                          textDecoration: "none",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                          },
                          minWidth: 150,
                        }}
                      >
                        Play as {userCharacter.name}
                      </Button>
                    )}
                    {currentFight && (
                      <Button
                        component={Link}
                        href={`/encounters/${currentFight.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        size="large"
                        startIcon={<FaPlay />}
                        sx={{
                          bgcolor: "white",
                          color: "#ff6b6b",
                          fontWeight: "bold",
                          textDecoration: "none",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                          },
                          minWidth: 150,
                        }}
                      >
                        {userCharacter ? "Manage Fight" : "Join Fight"}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              )}
            </Box>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
