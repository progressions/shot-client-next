"use client"

import type { Juncture } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type MembersListProperties = {
  juncture: Juncture
  setJuncture: (juncture: Juncture) => void
}

export default function MembersList({
  juncture,
  setJuncture,
}: MembersListProperties) {
  const { client } = useClient()

  async function update(junctureId: string, formData: FormData) {
    try {
      const response = await client.updateJuncture(junctureId, formData)
      setJuncture(response.data)
    } catch (error) {
      console.error("Error updating juncture:", error)
      throw error
    }
  }

  return (
    <ListManager
      entity={juncture}
      name="Juncture"
      collection="characters"
      collection_ids="character_ids"
      title="Juncture Members"
      description={
        <>
          <InfoLink href="/characters" info="Characters" /> born into a specific{" "}
          <InfoLink href="/junctures" info="Juncture" /> often travel through
          the <InfoLink info="Netherworld" />, participating in the{" "}
          <InfoLink info="Chi War" />, enaging in its conflicts and shaping its
          outcomes.
        </>
      }
      update={update}
    />
  )
}
