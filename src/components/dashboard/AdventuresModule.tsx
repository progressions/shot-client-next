import { getServerClient } from "@/lib"
import { Icon } from "@/components/ui"
import { ErrorModule } from "@/components/dashboard"
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

  const sizeMap: Record<string, "sm" | "md" | "lg"> = {
    small: "sm",
    medium: "md",
    large: "lg",
  }
  const abbrevSize = sizeMap[size] || "md"

  return (
    <AdventuresModuleClient
      initialAdventures={adventures}
      userId={userId}
      size={abbrevSize}
    />
  )
}
