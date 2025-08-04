"use client"

import type { Character } from "@/types"
import { InfoLink } from "@/components/links"
import { SchtickManager } from "@/components/schticks"
import { Icon } from "@/lib"
import { ListManager } from "@/components/lists"
import { useState, useEffect } from "react"
import { useClient } from "@/contexts"

type SchticksProperties = {
  character: Pick<Character, "id" | "user" | "schtick_ids">
  setCharacter: (character: Character) => void
}

export default function Schticks({
  character,
  setCharacter,
  updateCharacter,
}: SchticksProperties) {
  const { client } = useClient()
  const [schticks, setSchticks] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const fetchSchticks = async () => {
      try {
        const response = await client.getSchticks({
          character_id: character.id,
          per_page: 100,
          sort: "name",
          order: "asc",
        })
        setSchticks(response.data.schticks || [])
        setLoaded(true)
      } catch (error) {
        console.error("Error fetching schticks:", error)
      }
    }

    fetchSchticks()
  }, [client, character.id])

  if (!loaded) return

  return (
    <ListManager
      icon={<Icon keyword="Schticks" />}
      entity={{ ...character, schticks }}
      name="schticks"
      title="Schticks"
      description={
        <>
          <InfoLink href="/schticks" info="Schticks" /> are special abilities or
          powers, such as <InfoLink info="Martial Arts" /> techniques or{" "}
          <InfoLink info="Magic" /> spells.
        </>
      }
      update={updateCharacter}
      collection="schticks"
      collection_ids="schtick_ids"
      manage={true}
    />
  )
}
