"use client"

import type { Fight } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"
import { Icon } from "@/lib"

type VehiclesListProperties = {
  fight: Fight
  setFight: (fight: Fight) => void
}

export default function VehiclesList({
  fight,
  setFight,
}: VehiclesListProperties) {
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
      icon={<Icon keyword="Vehicles" size="24" />}
      entity={fight}
      name="Fight"
      collection="vehicles"
      collection_ids="vehicle_ids"
      title="Vehicles"
      description={
        <>
          A <InfoLink href="/fights" info="Fight" /> may include{" "}
          <InfoLink href="/vehicles" info="Vehicles" />, either as a chase or a
          road battle.
        </>
      }
      update={update}
    />
  )
}
