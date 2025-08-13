"use client"

import { Box } from "@mui/material"
import type { Character } from "@/types"
import { Manager, Icon, InfoLink } from "@/components/ui"

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
      <Manager
        icon={<Icon keyword="Parties" />}
        name="Character"
        title="Parties"
        parentEntity={character}
        childEntityName="Party"
        description={
          <>
            A <InfoLink href="/characters" info="Character" /> may belong to
            one or more <InfoLink href="/parties" info="Parties" />, allowing
            him to work with others on missions and adventures in the world of the{" "}
            <InfoLink info="Chi War" />
          </>
        }
        onListUpdate={updateCharacter}
      />
    </Box>
  )
}
