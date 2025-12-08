"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import KeyIcon from "@mui/icons-material/Key"
import CloudDoneIcon from "@mui/icons-material/CloudDone"
import { Button, TextField } from "@/components/ui"
import { PasskeyRegistration } from "@/components/auth"
import { useClient, useToast } from "@/contexts"
import { browserSupportsWebAuthn } from "@simplewebauthn/browser"
import type { WebAuthnCredential } from "@/types/auth"
import { formatDistanceToNow } from "date-fns"

export function PasskeyManager() {
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [credentialToDelete, setCredentialToDelete] =
    useState<WebAuthnCredential | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [credentialToEdit, setCredentialToEdit] =
    useState<WebAuthnCredential | null>(null)
  const [editName, setEditName] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  // Check WebAuthn support on client-side only to avoid hydration mismatch
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn())
  }, [])

  const fetchCredentials = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await client.listPasskeys()
      setCredentials(response.data.credentials)
    } catch (err) {
      console.error("Failed to fetch passkeys:", err)
      setError("Failed to load passkeys")
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => {
    fetchCredentials()
  }, [fetchCredentials])

  const handleDeleteClick = (credential: WebAuthnCredential) => {
    setCredentialToDelete(credential)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!credentialToDelete) return

    setIsDeleting(true)
    try {
      await client.deletePasskey(credentialToDelete.id)
      toastSuccess("Passkey deleted successfully")
      setCredentials(prev => prev.filter(c => c.id !== credentialToDelete.id))
      setDeleteDialogOpen(false)
      setCredentialToDelete(null)
    } catch (err) {
      console.error("Failed to delete passkey:", err)
      toastError("Failed to delete passkey")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCredentialToDelete(null)
  }

  const handleEditClick = (credential: WebAuthnCredential) => {
    setCredentialToEdit(credential)
    setEditName(credential.name)
    setEditDialogOpen(true)
  }

  const handleEditConfirm = async () => {
    if (!credentialToEdit || !editName.trim()) return

    setIsEditing(true)
    try {
      const response = await client.renamePasskey(
        credentialToEdit.id,
        editName.trim()
      )
      toastSuccess("Passkey renamed successfully")
      setCredentials(prev =>
        prev.map(c =>
          c.id === credentialToEdit.id ? { ...c, name: response.data.name } : c
        )
      )
      setEditDialogOpen(false)
      setCredentialToEdit(null)
    } catch (err) {
      console.error("Failed to rename passkey:", err)
      toastError("Failed to rename passkey")
    } finally {
      setIsEditing(false)
    }
  }

  const handleEditCancel = () => {
    setEditDialogOpen(false)
    setCredentialToEdit(null)
    setEditName("")
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Unknown"
    }
  }

  if (!isSupported) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Your browser does not support passkeys. To use passkeys, please
          upgrade to a modern browser.
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <KeyIcon color="primary" />
          <Typography variant="h6">Passkeys</Typography>
        </Box>
        <PasskeyRegistration onSuccess={fetchCredentials} />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Passkeys are a more secure and convenient way to sign in. They use your
        device&apos;s biometrics (fingerprint or face) or a security key.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box>
          {[1, 2].map(i => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={72}
              sx={{ mb: 1, borderRadius: 1 }}
            />
          ))}
        </Box>
      ) : credentials.length === 0 ? (
        <Alert severity="info">
          You don&apos;t have any passkeys registered yet. Add a passkey to
          enable passwordless sign-in.
        </Alert>
      ) : (
        <List>
          {credentials.map(credential => (
            <ListItem
              key={credential.id}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                "&:last-child": { mb: 0 },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1">{credential.name}</Typography>
                    {credential.backed_up && (
                      <Chip
                        icon={<CloudDoneIcon sx={{ fontSize: 16 }} />}
                        label="Synced"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box component="span">
                    <Typography
                      variant="body2"
                      component="span"
                      color="text.secondary"
                    >
                      Created {formatDate(credential.created_at)}
                    </Typography>
                    {credential.last_used_at && (
                      <Typography
                        variant="body2"
                        component="span"
                        color="text.secondary"
                      >
                        {" "}
                        &middot; Last used {formatDate(credential.last_used_at)}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="rename"
                  onClick={() => handleEditClick(credential)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteClick(credential)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Passkey</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the passkey &quot;
            {credentialToDelete?.name}&quot;? You will no longer be able to use
            this passkey to sign in.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            onClick={handleDeleteCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Name Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditCancel}>
        <DialogTitle>Rename Passkey</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Passkey Name"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            disabled={isEditing}
            fullWidth
            sx={{ mt: 1 }}
            inputProps={{ maxLength: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            onClick={handleEditCancel}
            disabled={isEditing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditConfirm}
            disabled={isEditing || !editName.trim()}
          >
            {isEditing ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default PasskeyManager
