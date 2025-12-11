"use client"

import { useState, useCallback } from "react"
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material"
import LinkIcon from "@mui/icons-material/Link"
import LinkOffIcon from "@mui/icons-material/LinkOff"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { FaDiscord } from "react-icons/fa"
import type { User } from "@/types"
import { SectionHeader } from "@/components/ui"
import { useClient, useToast } from "@/contexts"

interface DiscordLinkingSectionProps {
  user: User
  onUserUpdate: (user: User) => void
}

export default function DiscordLinkingSection({
  user,
  onUserUpdate,
}: DiscordLinkingSectionProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [linkCode, setLinkCode] = useState("")
  const [isLinking, setIsLinking] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)

  const handleLinkDiscord = useCallback(async () => {
    if (!linkCode.trim()) {
      toastError("Please enter a link code")
      return
    }

    setIsLinking(true)
    try {
      const response = await client.linkDiscord(linkCode.trim().toUpperCase())
      if (response.data.success) {
        toastSuccess(response.data.message)
        setLinkCode("")
        // Refresh user data to show linked status
        const userResponse = await client.getCurrentUser()
        onUserUpdate(userResponse.data)
      }
    } catch (error: unknown) {
      console.error("Failed to link Discord:", error)
      const errorResponse = error as {
        response?: { data?: { error?: string } }
      }
      toastError(
        errorResponse.response?.data?.error || "Failed to link Discord account"
      )
    } finally {
      setIsLinking(false)
    }
  }, [linkCode, client, toastSuccess, toastError, onUserUpdate])

  const handleUnlinkDiscord = useCallback(async () => {
    setIsUnlinking(true)
    try {
      const response = await client.unlinkDiscord()
      if (response.data.success) {
        toastSuccess(response.data.message)
        // Refresh user data to show unlinked status
        const userResponse = await client.getCurrentUser()
        onUserUpdate(userResponse.data)
      }
    } catch (error: unknown) {
      console.error("Failed to unlink Discord:", error)
      const errorResponse = error as {
        response?: { data?: { error?: string } }
      }
      toastError(
        errorResponse.response?.data?.error ||
          "Failed to unlink Discord account"
      )
    } finally {
      setIsUnlinking(false)
    }
  }, [client, toastSuccess, toastError, onUserUpdate])

  const isLinked = !!user.discord_id

  return (
    <Box sx={{ mb: 4 }}>
      <SectionHeader
        title="Discord Integration"
        icon={<FaDiscord />}
        sx={{ mb: 2 }}
      >
        Link your Discord account to interact with Chi War from Discord.
      </SectionHeader>

      {isLinked ? (
        <Stack direction="column" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "success.main",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CheckCircleIcon fontSize="small" />
              Discord account linked
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="error"
            onClick={handleUnlinkDiscord}
            disabled={isUnlinking}
            startIcon={
              isUnlinking ? <CircularProgress size={16} /> : <LinkOffIcon />
            }
            sx={{ alignSelf: "flex-start" }}
          >
            {isUnlinking ? "Unlinking..." : "Unlink Discord Account"}
          </Button>
        </Stack>
      ) : (
        <Stack direction="column" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            To link your Discord account:
          </Typography>
          <Box component="ol" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Open Discord and go to a server with the Chi War bot
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Type <code>/link</code> to get your unique link code
            </Typography>
            <Typography component="li" variant="body2">
              Enter the code below (expires in 5 minutes)
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="flex-start">
            <TextField
              label="Link Code"
              value={linkCode}
              onChange={e => setLinkCode(e.target.value.toUpperCase())}
              placeholder="ABCDEF"
              variant="outlined"
              size="small"
              inputProps={{
                maxLength: 6,
                style: {
                  fontFamily: "monospace",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                },
              }}
              sx={{ width: 150 }}
            />
            <Button
              variant="contained"
              onClick={handleLinkDiscord}
              disabled={isLinking || linkCode.length !== 6}
              startIcon={
                isLinking ? <CircularProgress size={16} /> : <LinkIcon />
              }
            >
              {isLinking ? "Linking..." : "Link Account"}
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
