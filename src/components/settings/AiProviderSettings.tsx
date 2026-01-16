"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Chip,
  Link,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import ErrorIcon from "@mui/icons-material/Error"
import { Button, TextField } from "@/components/ui"
import { useClient, useToast } from "@/contexts"
import type { AiCredential, AiProvider } from "@/types"
import { AI_PROVIDERS } from "@/types"

/**
 * AiProviderSettings displays and manages the user's AI provider credentials.
 *
 * Shows a list of supported AI providers with their connection status,
 * and provides functionality to add, update, and remove API keys.
 *
 * @example
 * // In profile/settings page
 * <AiProviderSettings />
 */
export function AiProviderSettings() {
  const [credentials, setCredentials] = useState<AiCredential[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add/Edit dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<AiProvider | null>(
    null
  )
  const [apiKeyInput, setApiKeyInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [credentialToDelete, setCredentialToDelete] =
    useState<AiCredential | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  const fetchCredentials = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await client.getAiCredentials()
      setCredentials(response.data.ai_credentials || [])
    } catch (err) {
      console.error("Failed to fetch AI credentials:", err)
      setError("Failed to load AI credentials")
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => {
    fetchCredentials()
  }, [fetchCredentials])

  const getCredentialForProvider = (
    provider: AiProvider
  ): AiCredential | undefined => {
    return credentials.find(c => c.provider === provider)
  }

  const handleAddClick = (provider: AiProvider) => {
    setSelectedProvider(provider)
    setApiKeyInput("")
    setAddDialogOpen(true)
  }

  const handleAddConfirm = async () => {
    if (!selectedProvider || !apiKeyInput.trim()) return

    setIsSaving(true)
    try {
      const existingCredential = getCredentialForProvider(selectedProvider)

      if (existingCredential) {
        // Update existing credential
        await client.updateAiCredential(existingCredential.id, {
          api_key: apiKeyInput.trim(),
        })
        toastSuccess(`${AI_PROVIDERS[selectedProvider].name} API key updated`)
      } else {
        // Create new credential
        await client.createAiCredential({
          provider: selectedProvider,
          api_key: apiKeyInput.trim(),
        })
        toastSuccess(`${AI_PROVIDERS[selectedProvider].name} connected`)
      }

      setAddDialogOpen(false)
      setSelectedProvider(null)
      setApiKeyInput("")
      await fetchCredentials()
    } catch (err) {
      console.error("Failed to save API key:", err)
      toastError("Failed to save API key")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCancel = () => {
    setAddDialogOpen(false)
    setSelectedProvider(null)
    setApiKeyInput("")
  }

  const handleDeleteClick = (credential: AiCredential) => {
    setCredentialToDelete(credential)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!credentialToDelete) return

    setIsDeleting(true)
    try {
      await client.deleteAiCredential(credentialToDelete.id)
      toastSuccess(
        `${AI_PROVIDERS[credentialToDelete.provider].name} disconnected`
      )
      setCredentials(prev => prev.filter(c => c.id !== credentialToDelete.id))
      setDeleteDialogOpen(false)
      setCredentialToDelete(null)
    } catch (err) {
      console.error("Failed to delete credential:", err)
      toastError("Failed to disconnect provider")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCredentialToDelete(null)
  }

  const providers = Object.values(AI_PROVIDERS)

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
          <SmartToyIcon color="primary" />
          <Typography variant="h6">AI Providers</Typography>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Connect your AI service accounts to enable character generation and
        image creation. Your API keys are stored securely and never shared.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box>
          {[1, 2, 3].map(i => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={72}
              sx={{ mb: 1, borderRadius: 1 }}
            />
          ))}
        </Box>
      ) : (
        <List>
          {providers.map(provider => {
            const credential = getCredentialForProvider(provider.id)
            const isConnected = !!credential
            const isActive = isConnected && credential.status === "active"
            const isSuspended = isConnected && credential.status === "suspended"
            const isInvalid = isConnected && credential.status === "invalid"

            // Determine border color based on status
            const borderColor = !isConnected
              ? "divider"
              : isActive
                ? "success.main"
                : isSuspended
                  ? "warning.main"
                  : "error.main"

            return (
              <ListItem
                key={provider.id}
                sx={{
                  border: 1,
                  borderColor,
                  borderRadius: 1,
                  mb: 1,
                  "&:last-child": { mb: 0 },
                  bgcolor: isConnected ? "action.selected" : "background.paper",
                  flexDirection: "column",
                  alignItems: "stretch",
                }}
              >
                <Box
                  sx={{ display: "flex", width: "100%", alignItems: "center" }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body1">{provider.name}</Typography>
                        {isActive && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                            label="Connected"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                        {isSuspended && (
                          <Chip
                            icon={<WarningIcon sx={{ fontSize: 16 }} />}
                            label="Suspended"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                        {isInvalid && (
                          <Chip
                            icon={<ErrorIcon sx={{ fontSize: 16 }} />}
                            label="Invalid"
                            size="small"
                            color="error"
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
                          {provider.description}
                        </Typography>
                        {isConnected && credential.api_key_hint && (
                          <Typography
                            variant="body2"
                            component="span"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            &middot; Key: {credential.api_key_hint}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      ml: "auto",
                      flexShrink: 0,
                    }}
                  >
                    <Button
                      variant={isConnected ? "outlined" : "contained"}
                      size="small"
                      onClick={() => handleAddClick(provider.id)}
                      sx={{ mr: 1 }}
                    >
                      {isConnected ? "Update Key" : "Add Key"}
                    </Button>
                    {isConnected && (
                      <IconButton
                        edge="end"
                        aria-label="disconnect"
                        onClick={() => handleDeleteClick(credential)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                {/* Status message alert for suspended/invalid credentials */}
                {(isSuspended || isInvalid) && credential.status_message && (
                  <Alert
                    severity={isSuspended ? "warning" : "error"}
                    sx={{ mt: 1, width: "100%" }}
                  >
                    {credential.status_message}
                    {isSuspended && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Update your API key or check your billing settings to
                        continue using this provider.
                      </Typography>
                    )}
                    {isInvalid && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Please update your API key with a valid one.
                      </Typography>
                    )}
                  </Alert>
                )}
              </ListItem>
            )
          })}
        </List>
      )}

      {/* Add/Update API Key Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleAddCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedProvider && getCredentialForProvider(selectedProvider)
            ? `Update ${AI_PROVIDERS[selectedProvider].name} API Key`
            : selectedProvider
              ? `Connect ${AI_PROVIDERS[selectedProvider].name}`
              : "Add API Key"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your API key for{" "}
            {selectedProvider && AI_PROVIDERS[selectedProvider].name}. You can
            find your API key at{" "}
            <Link
              href={
                selectedProvider ? AI_PROVIDERS[selectedProvider].helpUrl : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              {selectedProvider && AI_PROVIDERS[selectedProvider].helpUrl}
            </Link>
          </DialogContentText>
          <TextField
            autoFocus
            label="API Key"
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            disabled={isSaving}
            fullWidth
            placeholder={
              selectedProvider
                ? AI_PROVIDERS[selectedProvider].placeholder
                : "Enter API key"
            }
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={handleAddCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleAddConfirm}
            disabled={isSaving || !apiKeyInput.trim()}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Disconnect Provider</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disconnect{" "}
            {credentialToDelete &&
              AI_PROVIDERS[credentialToDelete.provider].name}
            ? You will need to re-enter your API key to use this provider again.
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
            {isDeleting ? "Disconnecting..." : "Disconnect"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default AiProviderSettings
