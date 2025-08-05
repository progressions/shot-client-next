"use client"

import { Box } from "@mui/material"
import type { Character } from "@/types"
import { Icon, InfoLink, ListManager } from "@/components/ui"

type PartiesProperties = {
  character: Character
  updateCharacter?: (character: Character) => void
}

export default function Parties({
  character,
  updateCharacter,
}: PartiesProperties) {
  return (
    <Box>
      <ListManager
        icon={<Icon keyword="Parties" />}
        entity={character}
        name="Character"
        title="Parties"
        description={
          <>
            A <InfoLink href="/characters" info="Character" /> organizes its
            members into <InfoLink href="/parties" info="Parties" />, allowing
            them to work together on missions and adventures in the world of the{" "}
            <InfoLink info="Chi War" />
          </>
        }
        updateEntity={updateCharacter}
        collection="parties"
        collection_ids="party_ids"
        manage={true}
      />
    </Box>
  )
}
