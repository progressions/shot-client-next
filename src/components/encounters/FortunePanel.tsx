"use client"

import { useState } from "react"
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material"
import { AutoAwesome, Add, Remove } from "@mui/icons-material"
import { useClient, useToast } from "@/contexts"
import BasePanel from "./BasePanel"
import { CS } from "@/services"
import type { Character } from "@/types"

interface FortunePanelProps {
  character: Character
  onComplete?: () => void
}

export default function FortunePanel({
  character,
  onComplete,
}: FortunePanelProps) {
  const { client } = useClient()
  const { toastError, toastSuccess } = useToast()
  const [loading, setLoading] = useState(false)

  const fortune = CS.fortune(character)
  const maxFortune = CS.maxFortune(character)
  const fortuneType = CS.fortuneType(character) || "Fortune"

  const handleUpdateFortune = async (newValue: number) => {
    if (newValue < 0 || newValue > maxFortune) return

    setLoading(true)
    try {
      await client.updateCharacterCombatStats(character.id, {
        action_values: {
          ...character.action_values,
          Fortune: newValue,
        },
      })

      const diff = newValue - fortune
      if (diff < 0) {
        toastSuccess(`Spent 1 ${fortuneType}`)
      } else {
        toastSuccess(`Recovered 1 ${fortuneType}`)
      }

      // We don't strictly need to close, allowing multiple spends, but user might expect it.
      // Let's keep it open for rapid spending/adjustment unless user clicks away.
    } catch (error) {
      console.error("Failed to update fortune", error)
      toastError(`Failed to update ${fortuneType}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BasePanel
      title={`Manage ${fortuneType}`}
      icon={<AutoAwesome />}
      borderColor="warning.main"
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="div"
          color="warning.main"
          fontWeight="bold"
        >
          {fortune}{" "}
          <Typography component="span" variant="h6" color="text.secondary">
            / {maxFortune}
          </Typography>
        </Typography>

        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Button
            variant="contained"
            color="warning"
            size="large"
            onClick={() => handleUpdateFortune(fortune - 1)}
            disabled={loading || fortune <= 0}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Remove />
              )
            }
          >
            SPEND
          </Button>

          <IconButton
            onClick={() => handleUpdateFortune(fortune + 1)}
            disabled={loading || fortune >= maxFortune}
            color="default"
            sx={{ border: 1, borderColor: "divider" }}
          >
            <Add />
          </IconButton>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Spend {fortuneType} to boost rolls or activate abilities.
        </Typography>
      </Box>
    </BasePanel>
  )
}
