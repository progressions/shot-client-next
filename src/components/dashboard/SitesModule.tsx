import { Box, Stack, Typography } from "@mui/material"
import { getServerClient } from "@/lib"
import { SiteBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ErrorModule, ModuleHeader } from "@/components/dashboard"
import type { Site } from "@/types"

interface SitesModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default async function SitesModule({
  userId,
  size = "medium",
}: SitesModuleProps) {
  const client = await getServerClient()
  if (!client) {
    throw new Error("Failed to initialize client")
  }

  let sites: Site[] = []
  try {
    const sitesResponse = await client.getSites({
      user_id: userId,
      per_page: 5,
      sort: "created_at",
      order: "desc",
    })
    sites = sitesResponse.data?.sites || []
  } catch (error) {
    console.error("Error fetching sites:", error)
    return (
      <ErrorModule
        title="Your Sites"
        message="Failed to load sites."
        icon={<Icon keyword="Site" />}
      />
    )
  }
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
      <ModuleHeader title="Your Sites" icon={<Icon keyword="Site" />} />
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