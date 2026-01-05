"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import type { Campaign, AiCredential, AiProvider } from "@/types"
import { AI_PROVIDERS } from "@/types"
import { useClient, useToast } from "@/contexts"

interface AiProviderSelectorProps {
  campaign: Campaign
  onProviderChange: (provider: AiProvider | null) => void
}

/**
 * AiProviderSelector allows gamemasters to select which AI provider
 * to use for character and image generation in a campaign.
 *
 * Only shows providers the user has configured credentials for.
 */
export function AiProviderSelector({
  campaign,
  onProviderChange,
}: AiProviderSelectorProps) {
  const [credentials, setCredentials] = useState<AiCredential[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<AiProvider | "">(
    campaign.ai_provider || ""
  )
  const [isSaving, setIsSaving] = useState(false)

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

  // Sync local state when campaign changes
  useEffect(() => {
    setSelectedProvider(campaign.ai_provider || "")
  }, [campaign.ai_provider])

  const handleProviderChange = async (event: SelectChangeEvent<string>) => {
    const newProvider = event.target.value as AiProvider | ""
    const previousProvider = selectedProvider
    const providerValue = newProvider || null

    // Optimistically update local state
    setSelectedProvider(newProvider)
    setIsSaving(true)

    try {
      // Update campaign via API
      const formData = new FormData()
      formData.set(
        "campaign",
        JSON.stringify({
          ai_provider: providerValue,
        })
      )
      await client.updateCampaign(campaign.id, formData)

      // Notify parent component
      onProviderChange(providerValue)

      const providerName = newProvider ? AI_PROVIDERS[newProvider].name : "None"
      toastSuccess(`AI provider set to ${providerName}`)
    } catch (err) {
      console.error("Failed to update AI provider:", err)
      // Revert on error
      setSelectedProvider(previousProvider)
      toastError("Failed to update AI provider")
    } finally {
      setIsSaving(false)
    }
  }

  // Filter to only connected providers
  const connectedProviders = credentials.map(c => c.provider)
  const availableProviders = Object.values(AI_PROVIDERS).filter(provider =>
    connectedProviders.includes(provider.id)
  )

  // Helper to get credential for a provider
  const getCredentialForProvider = (providerId: AiProvider) =>
    credentials.find(c => c.provider === providerId)

  // Check if a provider is suspended (billing limit reached)
  const isProviderSuspended = (providerId: AiProvider) => {
    const credential = getCredentialForProvider(providerId)
    return credential?.status === "suspended"
  }

  // Check if a provider is invalid (auth failed)
  const isProviderInvalid = (providerId: AiProvider) => {
    const credential = getCredentialForProvider(providerId)
    return credential?.status === "invalid"
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Loading AI providers...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box sx={{ my: 2 }}>
      <FormControl fullWidth disabled={isSaving}>
        <InputLabel id="ai-provider-label">AI Provider</InputLabel>
        <Select
          labelId="ai-provider-label"
          id="ai-provider-select"
          value={selectedProvider}
          label="AI Provider"
          onChange={handleProviderChange}
        >
          <MenuItem value="">
            <em>None (use default)</em>
          </MenuItem>
          {availableProviders.map(provider => {
            const isSuspended = isProviderSuspended(provider.id)
            const isInvalid = isProviderInvalid(provider.id)
            const isDisabled = isSuspended || isInvalid

            let statusText = ""
            if (isSuspended) {
              statusText = " (billing limit reached)"
            } else if (isInvalid) {
              statusText = " (authentication failed)"
            }

            return (
              <MenuItem
                key={provider.id}
                value={provider.id}
                disabled={isDisabled}
                sx={{
                  color: isDisabled ? "text.disabled" : "inherit",
                }}
              >
                {provider.name}
                {statusText && (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: "error.main",
                      ml: 0.5,
                      fontStyle: "italic",
                    }}
                  >
                    {statusText}
                  </Typography>
                )}
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Select which AI provider to use for character and image generation in
        this campaign.
        {availableProviders.length === 0 && (
          <>
            {" "}
            <Link href="/profile" underline="hover">
              Configure AI providers in your profile
            </Link>{" "}
            to enable this feature.
          </>
        )}
      </Typography>
    </Box>
  )
}

export default AiProviderSelector
