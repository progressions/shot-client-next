"use client"

import { Box, Stack } from "@mui/material"
import SettingsIcon from "@mui/icons-material/Settings"
import type { User } from "@/types"
import { Icon, SectionHeader } from "@/components/ui"
import {
  PasskeyManager,
  PasswordChangeForm,
  CliSessionsDisplay,
} from "@/components/settings"

interface SettingsPageClientProps {
  user: User
}

export default function SettingsPageClient({ user }: SettingsPageClientProps) {
  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Settings"
          icon={<SettingsIcon color="primary" />}
          sx={{ mb: 2 }}
        >
          Manage your security and account settings.
        </SectionHeader>
      </Box>

      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Security"
          icon={<Icon keyword="Security" />}
          sx={{ mb: 2 }}
        >
          Manage your authentication methods and security settings.
        </SectionHeader>
        <Stack spacing={2}>
          <PasswordChangeForm />
          <PasskeyManager />
          <CliSessionsDisplay />
        </Stack>
      </Box>
    </Box>
  )
}
