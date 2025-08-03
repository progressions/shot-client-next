"use client"

import Groups2Icon from "@mui/icons-material/Groups2"
import { CircularProgress, Box } from "@mui/material"
import type { Character, Party } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"
import { useEffect, useState } from "react"

type PartiesProperties = {
  character: Pick<Character, "id" | "user" | "party_ids">
  setCharacter: (character: Character) => void
}

export default function Parties({
  character,
  setCharacter,
}: PartiesProperties) {
  const { client } = useClient()
  const [parties, setParties] = useState<Party[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchParties = async () => {
      try {
        setIsLoading(true)
        const response = await client.getParties({ character_id: character.id })
        setParties(response.data.parties || [])
      } catch (error) {
        console.error("Error fetching parties:", error)
        setParties([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchParties().catch(error => {
      console.error("Error in useEffect fetchParties:", error)
      setIsLoading(false)
    })
  }, [client, character.id])

  async function update(characterId: string, formData: FormData) {
    try {
      const response = await client.updateCharacter(characterId, formData)
      setCharacter(response.data)
    } catch (error) {
      console.error("Error updating character:", error)
      throw error
    }
  }

  if (!character.user) return null

  if (isLoading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", my: 2 }} />
  }

  return (
    <Box>
      <ListManager
        icon={<Groups2Icon />}
        entity={{ ...character, parties }}
        name="Character"
        collection="parties"
        collection_ids="party_ids"
        title="Parties"
        description={
          <>
            A <InfoLink href="/characters" info="Character" /> organizes its
            members into <InfoLink href="/parties" info="Parties" />, allowing
            them to work together on missions and adventures in the world of the{" "}
            <InfoLink info="Chi War" />
          </>
        }
        update={update}
      />
    </Box>
  )
}
