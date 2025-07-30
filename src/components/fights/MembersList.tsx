"use client"

import type { Fight } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type MembersListProperties = {
  fight: Fight
  setFight: (fight: Fight) => void
}

export default function MembersList({
  fight,
  setFight,
}: MembersListProperties) {
  const { client } = useClient()

  async function update(fightId: string, formData: FormData) {
    try {
      const response = await client.updateFight(fightId, formData)
      setFight(response.data)
    } catch (error) {
      console.error("Error updating fight:", error)
      throw error
    }
  }

  return (
    <ListManager
      entity={fight}
      name="Fight"
      collection="actors"
      collection_ids="character_ids"
      title="Fight Members"
      description={
        <>
          A <InfoLink href="/fights" info="Fight" /> is a battle between{" "}
          <InfoLink href="/characters" info="Characters" />, with the stakes{" "}
          often involving control of a{" "}
          <InfoLink href="/sites" info="Feng Shui Site" />.
        </>
      }
      update={update}
    />
  )
}
