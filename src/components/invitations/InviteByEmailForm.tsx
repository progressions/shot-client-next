"use client"

import { useState } from "react"
import { Box, TextField, Button, CircularProgress } from "@mui/material"
import { useClient, useToast, useCampaign } from "@/contexts"
import type { Invitation } from "@/types"

interface InviteByEmailFormProps {
  onInvitationCreated?: (invitation: Invitation) => void
}

export default function InviteByEmailForm({
  onInvitationCreated,
}: InviteByEmailFormProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { campaign } = useCampaign()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!campaign) {
      toastError("No campaign selected")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await client.createInvitation(email.trim())
      toastSuccess(`Invitation sent to ${email}`)
      setEmail("")
      onInvitationCreated?.(response.data)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitation"
      setError(errorMessage)
      toastError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
    >
      <TextField
        size="small"
        placeholder="Enter email address to invite"
        value={email}
        onChange={e => {
          setEmail(e.target.value)
          setError(null)
        }}
        error={!!error}
        helperText={error}
        disabled={loading}
        sx={{ flex: 1 }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={loading || !email.trim()}
        sx={{ minWidth: 120 }}
      >
        {loading ? <CircularProgress size={20} /> : "Send invitation"}
      </Button>
    </Box>
  )
}
