"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { ContentCopy, Refresh, Check, Close } from "@mui/icons-material"
import { FaLink } from "react-icons/fa6"
import { Button } from "@/components/ui"
import { useEncounter, useClient, useToast } from "@/contexts"
import FightService from "@/services/FightService"
import type { Character } from "@/types"

interface InvitePlayersModalProps {
  open: boolean
  onClose: () => void
}

interface TokenInfo {
  url: string
  expires_at: string
  loading: boolean
  copied: boolean
}

export default function InvitePlayersModal({
  open,
  onClose,
}: InvitePlayersModalProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"))
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  // Track generated tokens for each character
  const [tokens, setTokens] = useState<Record<string, TokenInfo>>({})
  const [loadingExisting, setLoadingExisting] = useState(false)
  const copiedTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Get PC characters in the encounter
  const pcCharacters = useMemo(() => {
    if (!encounter) return []
    return FightService.playerCharacters(encounter)
  }, [encounter])

  // Fetch existing tokens when modal opens, clear when it closes
  useEffect(() => {
    if (open && encounter) {
      // Fetch existing valid tokens
      setLoadingExisting(true)
      client
        .listPlayerViewTokens(encounter.id)
        .then(response => {
          const existingTokens: Record<string, TokenInfo> = {}
          for (const token of response.data.tokens) {
            existingTokens[token.character_id] = {
              url: token.url,
              expires_at: token.expires_at,
              loading: false,
              copied: false,
            }
          }
          setTokens(existingTokens)
        })
        .catch(error => {
          console.error("Failed to fetch existing tokens:", error)
          // Don't show error to user - they can still generate new tokens
        })
        .finally(() => {
          setLoadingExisting(false)
        })
    } else if (!open) {
      setTokens({})
      // Clear all copied timeouts when modal closes
      Object.values(copiedTimeoutsRef.current).forEach(clearTimeout)
      copiedTimeoutsRef.current = {}
    }
  }, [open, encounter, client])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(copiedTimeoutsRef.current).forEach(clearTimeout)
    }
  }, [])

  const generateToken = async (character: Character) => {
    if (!encounter) return

    setTokens(prev => ({
      ...prev,
      [character.id]: { url: "", expires_at: "", loading: true, copied: false },
    }))

    try {
      const response = await client.generatePlayerViewToken(
        encounter.id,
        character.id
      )
      const { url, expires_at } = response.data

      setTokens(prev => ({
        ...prev,
        [character.id]: { url, expires_at, loading: false, copied: false },
      }))
    } catch (error) {
      console.error("Failed to generate token:", error)
      toastError("Failed to generate link")
      setTokens(prev => ({
        ...prev,
        [character.id]: {
          url: "",
          expires_at: "",
          loading: false,
          copied: false,
        },
      }))
    }
  }

  const copyToClipboard = async (characterId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setTokens(prev => ({
        ...prev,
        [characterId]: { ...prev[characterId], copied: true },
      }))
      toastSuccess("Link copied to clipboard!")

      // Clear any existing timeout for this character
      if (copiedTimeoutsRef.current[characterId]) {
        clearTimeout(copiedTimeoutsRef.current[characterId])
      }

      // Reset copied state after 3 seconds
      copiedTimeoutsRef.current[characterId] = setTimeout(() => {
        setTokens(prev => ({
          ...prev,
          [characterId]: { ...prev[characterId], copied: false },
        }))
        delete copiedTimeoutsRef.current[characterId]
      }, 3000)
    } catch {
      toastError("Failed to copy link")
    }
  }

  const formatExpiry = useCallback((expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffMs = expiry.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins <= 0) return "Expired"
    if (diffMins === 1) return "1 minute left"
    return `${diffMins} minutes left`
  }, [])

  // Memoize expired status for all tokens to avoid repeated date comparisons on each render
  const expiredTokens = useMemo(() => {
    const now = new Date()
    const expired: Record<string, boolean> = {}
    for (const [characterId, tokenInfo] of Object.entries(tokens)) {
      if (tokenInfo.expires_at) {
        expired[characterId] = new Date(tokenInfo.expires_at) <= now
      }
    }
    return expired
  }, [tokens])

  const isExpired = useCallback(
    (characterId: string) => expiredTokens[characterId] ?? false,
    [expiredTokens]
  )

  if (!encounter) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FaLink size={20} />
        Invite Players
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Generate magic links for players to join this encounter. Links expire
          after 10 minutes and can only be used once.
        </Typography>

        {loadingExisting ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress aria-label="Loading existing links" />
          </Box>
        ) : pcCharacters.length === 0 ? (
          <Alert severity="info">
            No player characters are in this encounter yet. Add characters to
            generate invite links.
          </Alert>
        ) : (
          <List>
            {pcCharacters.map(character => {
              const tokenInfo = tokens[character.id]
              const hasToken = tokenInfo?.url && !tokenInfo.loading
              const tokenExpired = hasToken && isExpired(character.id)

              return (
                <ListItem
                  key={character.id}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: "action.hover",
                    flexDirection: "column",
                    alignItems: "stretch",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <ListItemText
                      primary={character.name}
                      secondary={
                        character.user
                          ? `Player: ${character.user.name || character.user.email}`
                          : "No player assigned"
                      }
                    />
                    <ListItemSecondaryAction>
                      {tokenInfo?.loading ? (
                        <CircularProgress
                          size={24}
                          aria-label="Generating link"
                        />
                      ) : hasToken && !tokenExpired ? (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="Regenerate link">
                            <IconButton
                              size="small"
                              aria-label="Regenerate link"
                              onClick={() => generateToken(character)}
                            >
                              <Refresh />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={tokenInfo.copied ? "Copied!" : "Copy link"}
                          >
                            <IconButton
                              size="small"
                              aria-label={
                                tokenInfo.copied ? "Copied" : "Copy link"
                              }
                              onClick={() =>
                                copyToClipboard(character.id, tokenInfo.url)
                              }
                              color={tokenInfo.copied ? "success" : "default"}
                            >
                              {tokenInfo.copied ? <Check /> : <ContentCopy />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => generateToken(character)}
                          disabled={!character.user}
                        >
                          Generate Link
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </Box>

                  {/* Show URL and expiry when token is generated */}
                  {hasToken && (
                    <Box sx={{ mt: 1, width: "100%" }}>
                      {tokenExpired ? (
                        <Chip
                          label="Link expired - regenerate"
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              wordBreak: "break-all",
                              bgcolor: "background.paper",
                              p: 1,
                              borderRadius: 1,
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                            }}
                          >
                            {tokenInfo.url}
                          </Typography>
                          <Chip
                            label={formatExpiry(tokenInfo.expires_at)}
                            color="warning"
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </>
                      )}
                    </Box>
                  )}

                  {!character.user && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      This character has no player assigned
                    </Typography>
                  )}
                </ListItem>
              )
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
