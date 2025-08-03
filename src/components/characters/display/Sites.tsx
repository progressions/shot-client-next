"use client"

import { GiMagicGate } from "react-icons/gi"
import { CircularProgress, Box } from "@mui/material"
import type { Character, Site } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"
import { useEffect, useState } from "react"

type SitesListProperties = {
  character: Pick<Character, "id" | "user" | "site_ids">
  setCharacter: (character: Character) => void
}

export default function SitesList({
  character,
  setCharacter,
}: SitesListProperties) {
  const { client } = useClient()
  const [sites, setSites] = useState<Site[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setIsLoading(true)
        const response = await client.getSites({ character_id: character.id })
        setSites(response.data.sites || [])
      } catch (error) {
        console.error("Error fetching sites:", error)
        setSites([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchSites().catch(error => {
      console.error("Error in useEffect fetchSites:", error)
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

  const icon = (
    <Box sx={{ pt: 1, fontSize: "1.4rem" }}>
      <GiMagicGate />
    </Box>
  )

  return (
    <Box>
      <ListManager
        icon={icon}
        entity={{ ...character, sites }}
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
    </Box>
  )
}
