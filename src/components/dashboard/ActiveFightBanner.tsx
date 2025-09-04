"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { FaFire, FaUsers, FaPlay } from "react-icons/fa6"
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
  isGamemaster = false,
}: ActiveFightBannerProps) {
  const router = useRouter()
  const { subscription } = useApp()
  const { client } = useClient()
  const [currentFight, setCurrentFight] = useState<Fight | null>(null)
  const [loading, setLoading] = useState(true)
  const [participantCount, setParticipantCount] = useState(0)

  // Fetch current fight on mount and when campaign changes
  useEffect(() => {
    fetchCurrentFight()
  }, [campaignId, client])

  // Subscribe to WebSocket events for fight updates
  useEffect(() => {
    if (!subscription) return

    const handleFightUpdate = (data: any) => {
      if (data.type === "fight_ended" && data.fight_id === currentFight?.id) {
        // Fight has ended, clear the banner
        setCurrentFight(null)
      } else if (data.type === "fight_started") {
        // New fight started, fetch it
        fetchCurrentFight()
      }
    }

    subscription.received = handleFightUpdate

    return () => {
      if (subscription) {
        subscription.received = () => {}
      }
    }
  }, [subscription, currentFight?.id])

  const fetchCurrentFight = async () => {
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
    } catch (error: any) {
      // Check if it's a 204 response (no content)
      if (error?.response?.status === 204) {
        setCurrentFight(null)
      } else {
        console.error("Error fetching current fight:", error)
        setCurrentFight(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleJoinFight = () => {
    if (currentFight) {
      router.push(`/encounters/${currentFight.id}`)
    }
  }

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
              background: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background animation effect */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: "url('/images/fight-pattern.png')",
                backgroundSize: "cover",
                pointerEvents: "none",
              }}
            />

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
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
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

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleJoinFight}
                    startIcon={<FaPlay />}
                    sx={{
                      bgcolor: "white",
                      color: "#ff6b6b",
                      fontWeight: "bold",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                      },
                      minWidth: 150,
                    }}
                  >
                    Join Fight
                  </Button>
                </Stack>
              )}
            </Box>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  )
}