"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Button,
  Collapse,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material"
import { Icon, SectionHeader, InfoLink, ManageButton } from "@/components/ui"
import { type Campaign } from "@/types"
import { useClient, useToast } from "@/contexts"

interface NotionIntegrationPanelProps {
  campaign: Campaign
}

type DatabaseMapping = {
  id: string
  title: string | null
}

export default function NotionIntegrationPanel({
  campaign,
}: NotionIntegrationPanelProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [databases, setDatabases] = useState<DatabaseMapping[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Local state for mappings to allow optimistic updates or form handling
  const [mappings, setMappings] = useState<Record<string, string>>(
    campaign.notion_database_ids || {}
  )

  const isConnected = campaign.notion_connected

  const loadDatabases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await client.getNotionDatabases(campaign.id)
      setDatabases(response.data)
    } catch (err) {
      console.error("Failed to load Notion databases", err)
      setError("Failed to load Notion databases. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }, [campaign.id, client])

  useEffect(() => {
    if (isConnected) {
      loadDatabases()
    }
  }, [isConnected, loadDatabases])

  // Don't render if Notion OAuth is not configured on the backend
  if (!campaign.notion_oauth_available) {
    return null
  }

  const handleConnect = () => {
    // Redirect to Notion OAuth flow
    // Include JWT token in URL since browser redirects can't include Authorization headers
    const token = client.jwt
    if (!token) {
      setError("Authentication required. Please log in again.")
      return
    }
    const params = new URLSearchParams({
      campaign_id: campaign.id,
      token,
    })
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/notion/authorize?${params}`
  }

  const handleMappingChange = async (key: string, value: string) => {
    const previousMappings = mappings
    const newMappings = { ...mappings, [key]: value }
    setMappings(newMappings)

    try {
      const formData = new FormData()
      formData.set(
        "campaign",
        JSON.stringify({ notion_database_ids: newMappings })
      )
      await client.updateCampaign(campaign.id, formData)
      toastSuccess("Notion mapping saved")
    } catch (err) {
      console.error("Failed to save mapping", err)
      setMappings(previousMappings)
      setError("Failed to save mapping settings.")
      toastError("Failed to save mapping")
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <SectionHeader
        title="Notion Integration"
        icon={<Icon keyword="Notion" />}
        actions={<ManageButton open={open} onClick={setOpen} />}
      >
        Sync your campaign data with{" "}
        <InfoLink href="https://notion.so" info="Notion" />.
      </SectionHeader>

      <Collapse in={open}>
        <Box sx={{ mt: 2 }}>
          {!isConnected ? (
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="body2" color="text.secondary">
                Connect your Notion workspace to sync characters, factions, and
                more.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Icon keyword="Link" />}
                onClick={handleConnect}
              >
                Connect to Notion
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Alert severity="success" icon={<Icon keyword="Check" />}>
                Connected to{" "}
                <strong>
                  {campaign.notion_workspace_name || "Notion Workspace"}
                </strong>
              </Alert>

              <Typography variant="h6" fontSize="small">
                Database Mapping
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select which Notion database corresponds to each entity type.
              </Typography>

              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Stack spacing={2} sx={{ maxWidth: 400 }}>
                  {renderMappingSelect(
                    "characters",
                    "Characters",
                    databases,
                    mappings,
                    handleMappingChange
                  )}
                  {renderMappingSelect(
                    "factions",
                    "Factions",
                    databases,
                    mappings,
                    handleMappingChange
                  )}
                  {renderMappingSelect(
                    "parties",
                    "Parties",
                    databases,
                    mappings,
                    handleMappingChange
                  )}
                  {renderMappingSelect(
                    "sites",
                    "Sites",
                    databases,
                    mappings,
                    handleMappingChange
                  )}
                  {renderMappingSelect(
                    "junctures",
                    "Junctures",
                    databases,
                    mappings,
                    handleMappingChange
                  )}
                </Stack>
              )}

              {error && <Alert severity="error">{error}</Alert>}

              <Button
                variant="outlined"
                color="warning"
                startIcon={<Icon keyword="Refresh" />}
                onClick={handleConnect}
                sx={{ alignSelf: "flex-start" }}
              >
                Reconnect / Change Workspace
              </Button>
            </Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

function renderMappingSelect(
  key: string,
  label: string,
  databases: DatabaseMapping[],
  mappings: Record<string, string>,
  onChange: (key: string, value: string) => void
) {
  return (
    <FormControl fullWidth size="small" key={key}>
      <InputLabel>{label} Database</InputLabel>
      <Select
        value={mappings[key] || ""}
        label={`${label} Database`}
        onChange={e => onChange(key, e.target.value)}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {databases.map(db => (
          <MenuItem key={db.id} value={db.id}>
            {db.title || "Untitled"}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
