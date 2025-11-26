"use client"
import { useState } from "react"
import { Box, Button, Typography } from "@mui/material"
import { AccessTime } from "@mui/icons-material"
import { useClient, useToast, useEncounter } from "@/contexts"
import BasePanel from "./BasePanel"
import { NumberField } from "@/components/ui"
import type { Character } from "@/types"

interface SpendShotsPanelProps {
  character: Character
  onComplete?: () => void
}

export default function SpendShotsPanel({
  character,
  onComplete,
}: SpendShotsPanelProps) {
  const { client } = useClient()
  const { encounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const [shots, setShots] = useState(3)
  const [loading, setLoading] = useState(false)

  const handleSpend = async () => {
    if (!encounter) return
    setLoading(true)
    try {
      await client.spendShots(encounter, character, shots, null)

      toastSuccess(`Spent ${shots} shots`)
      if (onComplete) onComplete()
    } catch (e) {
      console.error(e)
      toastError("Failed to spend shots")
    } finally {
      setLoading(false)
    }
  }

  return (
    <BasePanel
      title="Spend Shots"
      icon={<AccessTime />}
      borderColor="info.main"
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Delay your turn or perform a minor action.
        </Typography>

        <NumberField
          label="Shots to Spend"
          value={shots}
          onChange={(e: React.ChangeEvent<HTMLInputElement> | number) => {
            const val = typeof e === "number" ? e : parseInt(e.target.value)
            setShots(val || 0)
          }}
          sx={{ mb: 2, width: "100%" }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleSpend}
          disabled={loading || shots <= 0}
        >
          {loading ? "Spending..." : "Spend Shots"}
        </Button>
      </Box>
    </BasePanel>
  )
}
