"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material"
import { Refresh, Delete, Check } from "@mui/icons-material"
import { useClient, useToast } from "@/contexts"
import type { Invitation } from "@/types"

interface PendingInvitationsProps {
  refreshTrigger?: number
}

export default function PendingInvitations({
  refreshTrigger,
}: PendingInvitationsProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await client.getInvitations()
      // Filter to only show pending (non-redeemed) invitations
      const pending = response.data.invitations.filter(inv => !inv.redeemed)
      setInvitations(pending)
    } catch (err) {
      console.error("Failed to fetch invitations:", err)
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations, refreshTrigger])

  const handleResend = async (invitation: Invitation) => {
    if (!invitation.id) return

    setResendingIds(prev => new Set(prev).add(invitation.id!))

    try {
      await client.resendInvitation(invitation)
      toastSuccess(`Invitation resent to ${invitation.email}`)
    } catch (err) {
      console.error("Failed to resend invitation:", err)
      toastError("Failed to resend invitation")
    } finally {
      setResendingIds(prev => {
        const next = new Set(prev)
        next.delete(invitation.id!)
        return next
      })
    }
  }

  const handleDelete = async (invitation: Invitation) => {
    if (!invitation.id) return

    setDeletingIds(prev => new Set(prev).add(invitation.id!))

    try {
      await client.deleteInvitation(invitation)
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id))
      toastSuccess(`Invitation to ${invitation.email} cancelled`)
    } catch (err) {
      console.error("Failed to delete invitation:", err)
      toastError("Failed to cancel invitation")
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev)
        next.delete(invitation.id!)
        return next
      })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Pending Invitations
      </Typography>
      <List dense disablePadding>
        {invitations.map(invitation => {
          const isResending = resendingIds.has(invitation.id!)
          const isDeleting = deletingIds.has(invitation.id!)
          const hasExistingAccount = !!invitation.pending_user

          return (
            <ListItem
              key={invitation.id}
              sx={{
                bgcolor: "action.hover",
                borderRadius: 1,
                mb: 0.5,
                pr: 12,
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2">{invitation.email}</Typography>
                    {hasExistingAccount && (
                      <Chip
                        icon={<Check sx={{ fontSize: 14 }} />}
                        label="Has account"
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                  </Box>
                }
                secondary={`Sent ${formatDate(invitation.created_at)}`}
              />
              <ListItemSecondaryAction>
                <Tooltip title="Resend invitation">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleResend(invitation)}
                      disabled={isResending || isDeleting}
                      aria-label="Resend invitation"
                    >
                      {isResending ? (
                        <CircularProgress size={18} />
                      ) : (
                        <Refresh fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancel invitation">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(invitation)}
                      disabled={isResending || isDeleting}
                      aria-label="Cancel invitation"
                      color="error"
                    >
                      {isDeleting ? (
                        <CircularProgress size={18} />
                      ) : (
                        <Delete fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}
