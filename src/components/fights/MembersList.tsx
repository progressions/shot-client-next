"use client"

import type { Fight } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type FormStateData = {
  page: number
  open: boolean
  character_id?: string | null
}

type MembersListProps = {
  fight: Fight
}

export default function MembersList({ fight }: MembersListProps) {
  const { client } = useClient()

  async function update(fightId: string, formData: FormData) {
    try {
      await client.updateFight(fightId, formData)
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
