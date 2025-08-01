"use client"

import type { Character } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type SitesListProperties = {
  character: Character
  setCharacter: (character: Character) => void
}

export default function SitesList({
  character,
  setCharacter,
}: SitesListProperties) {
  const { client } = useClient()

  async function update(characterId: string, formData: FormData) {
    try {
      const response = await client.updateCharacter(characterId, formData)
      setCharacter(response.data)
    } catch (error) {
      console.error("Error updating character:", error)
      throw error
    }
  }

  return (
    <ListManager
      entity={character}
      name="Character"
      collection="sites"
      collection_ids="site_ids"
      title="Feng Shui Sites"
      description={
        <>
          A <InfoLink href="/characters" info="Character" /> is attuned to{" "}
          <InfoLink href="/sites" info="Feng Shui Sites" />, which grant him{" "}
          <InfoLink href="/chi" info="Chi" />, increasing his power.
        </>
      }
      update={update}
    />
  )
}
