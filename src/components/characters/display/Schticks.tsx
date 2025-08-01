"use client"

import type { Character } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type SchticksProperties = {
  character: Character
}

export default function Schticks({ character }: SchticksProperties) {
  const { client } = useClient()

  async function update(characterId: string, formData: FormData) {
    try {
      await client.updateCharacter(characterId, formData)
    } catch (error) {
      console.error("Error updating character:", error)
      throw error
    }
  }

  return (
    <ListManager
      entity={character}
      name="Character"
      collection="schticks"
      collection_ids="schtick_ids"
      title="Schticks"
      description={
        <>
          <InfoLink href="/schticks" info="Schticks" /> are special abilities or{" "}
          powers your character can use.
        </>
      }
      update={update}
    />
  )
}
