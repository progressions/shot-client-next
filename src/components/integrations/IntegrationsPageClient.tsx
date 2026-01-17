"use client"

import { useCallback, useMemo, useState } from "react"
import { Alert, Box, Stack } from "@mui/material"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import ExtensionIcon from "@mui/icons-material/Extension"
import type { User } from "@/types"
import { Icon, SectionHeader } from "@/components/ui"
import { AiProviderSettings } from "@/components/settings"
import { DiscordLinkingSection } from "@/components/users/profile"
import NotionIntegrationPanel from "@/components/campaigns/NotionIntegrationPanel"
import { useCampaign } from "@/contexts"

interface IntegrationsPageClientProps {
  user: User
}

export default function IntegrationsPageClient({
  user: initialUser,
}: IntegrationsPageClientProps) {
  const [user, setUser] = useState(initialUser)
  const { campaign } = useCampaign()

  const hasCurrentCampaign = useMemo(
    () => Boolean(campaign?.id && campaign.id.trim() !== ""),
    [campaign?.id]
  )

  const hasAdminPermission =
    hasCurrentCampaign && (user.admin || campaign?.gamemaster_id === user.id)

  const handleUserUpdate = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Integrations"
          icon={<ExtensionIcon color="primary" />}
          sx={{ mb: 2 }}
        >
          Connect external services to enhance your experience.
        </SectionHeader>
      </Box>

      {user.gamemaster && (
        <Box sx={{ mb: 4 }}>
          <SectionHeader
            title="AI Providers"
            icon={<SmartToyIcon color="primary" />}
            sx={{ mb: 2 }}
          >
            Connect your AI service accounts for character and image generation.
          </SectionHeader>
          <AiProviderSettings />
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Campaign Integrations"
          icon={<Icon keyword="Campaign" color="primary" />}
          sx={{ mb: 2 }}
        >
          Manage Notion settings for the campaign you have selected.
        </SectionHeader>

        {!hasCurrentCampaign ? (
          <Alert severity="info" icon={<Icon keyword="Info" />}>
            Select a campaign to configure Notion. Visit the Campaigns page to
            choose your active campaign.
          </Alert>
        ) : (
          <Stack spacing={2}>
            <Alert severity="success" icon={<Icon keyword="Campaign" />}>
              Current Campaign: <strong>{campaign?.name}</strong>
            </Alert>

            {hasAdminPermission ? (
              <NotionIntegrationPanel campaign={campaign} />
            ) : (
              <Alert severity="warning" icon={<Icon keyword="Warning" />}>
                Only the Game Master can configure Notion for this campaign.
              </Alert>
            )}
          </Stack>
        )}
      </Box>

      <DiscordLinkingSection user={user} onUserUpdate={handleUserUpdate} />
    </Box>
  )
}
