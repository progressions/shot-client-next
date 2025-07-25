"use client"

import { useState } from "react"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Drawer, Box, Typography, Alert } from "@mui/material"
import { TextField, SaveButton, CancelButton } from "@/components/ui"
import Cookies from "js-cookie"
import Client from "@/lib/Client"
import type { Fight } from "@/types/types"
import { useClient } from "@/contexts"

interface CreateFightFormProps {
  open: boolean
  onClose: () => void
  onSave: (newFight: Fight) => void
}

export default function CreateFightForm({ open, onClose, onSave }: CreateFightFormProps) {
  const { client } = useClient()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    try {
      const response = await client.createFight({ name, description })
      console.log("response.data", response.data)
      const newFight = response.data
      onSave(newFight)
      setName("")
      setDescription("")
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Create fight error:", err)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    setError(null)
    onClose()
  }

  return (
    <Drawer anchor={isMobile ? "bottom" : "right"} open={open} onClose={handleClose}>
      <Box sx={{ width: isMobile ? "100%" : "30rem", height: isMobile ? "auto" : "100%", p: isMobile ? "1rem" : "2rem" }}>
        <Typography variant="h5" sx={{ mb: 2, color: "#ffffff" }}>
          New Fight
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
          autoFocus
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={4}
        />
        <Box sx={{ display: "flex", gap: "1rem", mt: 3 }}>
          <SaveButton onClick={handleSave}>
            Save
          </SaveButton>
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>
        </Box>
      </Box>
    </Drawer>
  )
}
