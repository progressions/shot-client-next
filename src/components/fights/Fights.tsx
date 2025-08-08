import { Box, Stack, Typography, Pagination } from "@mui/material"
import { getServerClient } from "@/lib/getServerClient"
import { NotFound, FightDetail } from "@/components/fights"
import { InfoLink } from "@/components/ui"
import type { Fight, PaginationMeta } from "@/types"

interface FightsProps {
  page: number
  sort: "created_at" | "updated_at" | "name"
  order: "asc" | "desc"
  initialIsMobile?: boolean
}

export default async function Fights({
  page,
  sort,
  order,
  initialIsMobile,
}: FightsProps) {
  const client = await getServerClient()
  if (!client) {
    console.error("Failed to initialize client")
    return <NotFound />
  }

  let fights: Fight[] = []
  let meta: PaginationMeta = { current_page: 1, total_pages: 1 }
  try {
    const response = await client.getFights({ page, sort, order })
    if (!response.data) {
      throw new Error("No data returned from getFights")
    }
    fights = response.data.fights || []
    meta = response.data.meta || { current_page: page, total_pages: 1 }
  } catch (error) {
    console.error("Error fetching fights:", error)
    return <NotFound />
  }

  return (
    <Box sx={{ p: 2, bgcolor: "#2d2d2d", borderRadius: 2 }}>
      <Typography variant="h4" sx={{ color: "#ffffff", mb: 2 }}>
        Your Fights
      </Typography>
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {fights.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No fights available. Visit <InfoLink href="/fights" info="Fights" />{" "}
            to create one.
          </Typography>
        ) : (
          fights.map(fight => (
            <FightDetail
              key={fight.id}
              fight={fight}
              isMobile={initialIsMobile ?? false}
            />
          ))
        )}
      </Stack>
      <Pagination
        count={meta.total_pages}
        page={meta.current_page}
        variant="outlined"
        color="primary"
        shape="rounded"
        size="large"
      />
    </Box>
  )
}
