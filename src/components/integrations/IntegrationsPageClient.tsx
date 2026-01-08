"use client"

import { useCallback, useState } from "react"
import { Box } from "@mui/material"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import ExtensionIcon from "@mui/icons-material/Extension"
import type { User } from "@/types"
import { SectionHeader } from "@/components/ui"
import { AiProviderSettings } from "@/components/settings"
import { DiscordLinkingSection } from "@/components/users/profile"

interface IntegrationsPageClientProps {
  user: User
}

export default function IntegrationsPageClient({
  user: initialUser,
}: IntegrationsPageClientProps) {
  const [user, setUser] = useState(initialUser)

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

      <DiscordLinkingSection user={user} onUserUpdate={handleUserUpdate} />
    </Box>
  )
}
