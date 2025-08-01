"use client"

import type { Character } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type PartiesProperties = {
  character: Character
  setCharacter: (character: Character) => void
}

export default function Parties({
  character,
  setCharacter,
}: PartiesProperties) {
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
      collection="parties"
      collection_ids="party_ids"
      title="Parties"
      description={
        <>
          A <InfoLink href="/characters" info="Character" /> organizes its
          members into <InfoLink href="/parties" info="Parties" />, allowing
          them to work together on missions and adventures in the world of the{" "}
          <InfoLink info="Chi War" />.
        </>
      }
      update={update}
    />
  )
}
