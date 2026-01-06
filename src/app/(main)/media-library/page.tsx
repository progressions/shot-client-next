import { List } from "@/components/media-library"
import { requireCampaign } from "@/lib"

export const metadata = {
  title: "Media Library - Chi War",
}

export default async function MediaLibraryPage() {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  return <List />
}
