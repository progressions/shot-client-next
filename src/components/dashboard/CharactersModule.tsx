import { getServerClient } from "@/lib"
import { Icon } from "@/components/ui"
import { ErrorModule } from "@/components/dashboard"
import CharactersModuleClient from "./CharactersModuleClient"
import type { Character } from "@/types"

interface CharactersModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default async function CharactersModule({
  userId,
  size = "medium",
}: CharactersModuleProps) {
  const client = await getServerClient()
  if (!client) {
    throw new Error("Failed to initialize client")
  }

  let characters: Character[] = []
  try {
    const charactersResponse = await client.getCharacters({
      user_id: userId,
      per_page: 5,
      sort: "created_at",
      order: "desc",
    })
    characters = charactersResponse.data?.characters || []
  } catch (error) {
    console.error("Error fetching characters:", error)
    return (
      <ErrorModule
        title="Your Characters"
        message="Failed to load characters."
        icon={<Icon keyword="Character" />}
      />
    )
  }

  return (
    <CharactersModuleClient
      initialCharacters={characters}
      userId={userId}
      size={size}
    />
  )
}
