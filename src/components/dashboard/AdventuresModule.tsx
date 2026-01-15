import { Box, Stack, Typography } from "@mui/material"
import { getServerClient } from "@/lib"
import { AdventureBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ErrorModule, ModuleHeader } from "@/components/dashboard"
import AdventuresModuleClient from "./AdventuresModuleClient"
import type { Adventure } from "@/types"

interface AdventuresModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default async function AdventuresModule({
  userId,
  size = "medium",
}: AdventuresModuleProps) {
  const client = await getServerClient()
  if (!client) {
    throw new Error("Failed to initialize client")
  }

  let adventures: Adventure[] = []
  try {
    const adventuresResponse = await client.getAdventures({
      user_id: userId,
      per_page: 5,
      sort: "created_at",
      order: "desc",
      at_a_glance: true,
    })
    adventures = adventuresResponse.data?.adventures || []
  } catch (error) {
    console.error("Error fetching adventures:", error)
    return (
      <ErrorModule
        title="Your Adventures"
        message="Failed to load adventures."
        icon={<Icon keyword="Adventure" />}
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
    <AdventuresModuleClient>
      <Box
        sx={{
          flexGrow: 1,
          width: { xs: "100%", sm: "auto" },
          p: 2,
          borderRadius: 2,
          backgroundColor: "#2d2d2d",
        }}
      >
        <ModuleHeader
          title="Your Adventures"
          icon={<Icon keyword="Adventure" />}
        />
        <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
          {adventures.map(adventure => (
            <AdventureBadge
              key={adventure.id}
              adventure={adventure}
              size={abbrevSize}
            />
          ))}
        </Stack>
        <Typography variant="body2">
          <Link
            href="/adventures"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            All adventures
          </Link>
        </Typography>
      </Box>
    </AdventuresModuleClient>
  )
}
