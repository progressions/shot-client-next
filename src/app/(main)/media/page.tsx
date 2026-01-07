import { redirect } from "next/navigation"
import { List } from "@/components/media-library"
import { requireCampaign, getCurrentUser } from "@/lib"

export const metadata = {
  title: "Media Library - Chi War",
}

export default async function MediaLibraryPage() {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  // Server-side authorization - only gamemasters and admins can access
  const currentUser = await getCurrentUser()
  if (!currentUser?.gamemaster && !currentUser?.admin) {
    redirect("/")
  }

  return <List />
}
