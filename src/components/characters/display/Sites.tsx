"use client"

import { Box } from "@mui/material"
import type { Character } from "@/types"
import { Icon, InfoLink, Manager } from "@/components/ui"

type SitesListProperties = {
  character: Pick<Character, "id" | "user" | "site_ids">
  updateCharacter: (character: Character) => void
}

export default function SitesList({
  character,
  updateCharacter,
}: SitesListProperties) {
  return (
    <Box>
      <Manager
        icon={<Icon keyword="Sites" />}
        parentEntity={character}
        childEntityName="Site"
        name="Character"
        title="Feng Shui Sites"
        description={
          <>
            A <InfoLink href="/characters" info="Character" /> is attuned to{" "}
            <InfoLink href="/sites" info="Feng Shui Sites" />, which grant him{" "}
            <InfoLink href="/chi" info="Chi" />, increasing his power.
          </>
        }
        onListUpdate={updateCharacter}
      />
    </Box>
  )
}
