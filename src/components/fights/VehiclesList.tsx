"use client"

import type { Fight } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type FormStateData = {
  page: number
  open: boolean
  vehicle_id?: string | null
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
      collection="vehicles"
      collection_ids="vehicle_ids"
      title="Vehicles"
      description={
        <>
          A <InfoLink href="/fights" info="Fight" /> may include{" "}
          <InfoLink href="/vehicles" info="Characters" />, either as a chase or
          a road battle.
        </>
      }
      update={update}
    />
  )
}
