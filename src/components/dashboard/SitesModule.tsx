import type { Site } from "@/types"
import { Stack, Box, Typography } from "@mui/material"
import { SiteBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ModuleHeader } from "@/components/dashboard"

type SitesModuleProperties = {
  sites: Site[]
  size?: "small" | "medium" | "large"
}

export default function SitesModule({ sites, size="medium" }: SitesModuleProperties) {
  const sizeMap = {
    small: "sm",
    medium: "md",
    large: "lg",
  }
  const abbrevSize = sizeMap[size] || "md"

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: { xs: "100%", sm: "auto" },
        p: 2,
        borderRadius: 2,
        backgroundColor: "#2d2d2d",
      }}
    >
      <ModuleHeader title="Your Sites" icon={<Icon keyword="Sites" />} />
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {sites.map(site => (
          <SiteBadge key={site.id} site={site} size={abbrevSize} />
        ))}
      </Stack>
      <Typography variant="body2">
        <Link
          href="/sites"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          All sites
        </Link>
      </Typography>
    </Box>
  )
}
