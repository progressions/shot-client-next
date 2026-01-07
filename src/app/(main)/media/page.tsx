import { redirect } from "next/navigation"
import { List } from "@/components/media-library"
import { requireCampaign, getCurrentUser } from "@/lib"
import type { MediaLibraryFilters } from "@/types"

export const metadata = {
  title: "Media Library - Chi War",
}

// Valid filter values for validation
const VALID_STATUSES = ["all", "orphan", "attached"] as const
const VALID_SOURCES = ["all", "upload", "ai_generated"] as const
const VALID_ENTITY_TYPES = [
  "",
  "Character",
  "Vehicle",
  "Weapon",
  "Schtick",
  "Site",
  "Faction",
  "Party",
  "Fight",
  "User",
] as const

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    status?: string
    source?: string
    entity_type?: string
  }>
}) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  // Server-side authorization - only gamemasters and admins can access
  const currentUser = await getCurrentUser()
  if (!currentUser?.gamemaster && !currentUser?.admin) {
    redirect("/")
  }

  // Parse and validate search params
  const params = await searchParams

  // Validate page parameter
  const pageParam = params.page
  const page = pageParam ? Number.parseInt(pageParam, 10) : 1
  const validPage = isNaN(page) || page <= 0 ? 1 : page

  // Validate status parameter
  const status =
    params.status &&
    VALID_STATUSES.includes(params.status as (typeof VALID_STATUSES)[number])
      ? (params.status as "all" | "orphan" | "attached")
      : undefined

  // Validate source parameter
  const source =
    params.source &&
    VALID_SOURCES.includes(params.source as (typeof VALID_SOURCES)[number])
      ? (params.source as "all" | "upload" | "ai_generated")
      : undefined

  // Validate entity_type parameter
  const entity_type =
    params.entity_type &&
    VALID_ENTITY_TYPES.includes(
      params.entity_type as (typeof VALID_ENTITY_TYPES)[number]
    )
      ? params.entity_type
      : undefined

  // Build initial filters from URL params
  const initialFilters: MediaLibraryFilters = {
    page: validPage,
    per_page: 24,
    ...(status && status !== "all" && { status }),
    ...(source && source !== "all" && { source }),
    ...(entity_type && { entity_type }),
  }

  return <List initialFilters={initialFilters} />
}
