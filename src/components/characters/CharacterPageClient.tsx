"use client"

import AllInboxIcon from "@mui/icons-material/AllInbox"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import BoltIcon from "@mui/icons-material/Bolt"
import type { Character } from "@/types"
import { useClient, useCampaign } from "@/contexts"
import { useState, useEffect } from "react"
import { Box, Stack } from "@mui/material"
import { CharacterSpeedDial } from "@/components/characters"
import { CS } from "@/services"
import { SectionHeader } from "@/components/ui"
import {
  Header,
  Owner,
  Associations,
  ActionValues,
  Skills,
  Weapons,
  Description,
  Schticks,
  Parties,
  Sites,
} from "@/components/characters"

type CharacterPageClientProps = {
  character: Character
}

export default function CharacterPageClient({
  character: initialCharacter,
}: CharacterPageClientProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()
  const [character, setCharacter] = useState<Character>(initialCharacter)

  useEffect(() => {
    document.title = character.name ? `${character.name} - Chi War` : "Chi War"
  }, [character.name])

  useEffect(() => {
    if (
      campaignData?.character &&
      campaignData.character.id === initialCharacter.id
    ) {
      setCharacter(campaignData.character)
    }
  }, [campaignData, initialCharacter])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <CharacterSpeedDial
        character={character}
        client={client}
        setCharacter={setCharacter}
      />
      <Header character={character} />
      <Owner character={character} />
      <SectionHeader title="Action Values" icon={<BoltIcon />}>
        Action Values are the core stats of your Character, used to resolve
        actions and challenges in the game.
      </SectionHeader>
      <ActionValues character={character} />
      {!CS.isMook(character) && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            gap: { xs: 1, md: 2 },
            "& > *": {
              flex: { md: 1 },
              width: { xs: "100%", md: "50%" },
            },
          }}
        >
          <SectionHeader title="Personal Details" icon={<AssignmentIndIcon />}>
            Personal details about your character, such as their type,
            archetype, juncture, and wealth.
          </SectionHeader>
          <Associations character={character} />

          <SectionHeader title="Skills" icon={<AllInboxIcon />}>
            Skills are what your character can do. They are used to resolve
            actions and challenges in the game.
          </SectionHeader>
          <Skills character={character} />
        </Stack>
      )}
      <Description character={character} />
      <Weapons character={character} />
      {!CS.isMook(character) && (
        <Schticks character={character} setCharacter={setCharacter} />
      )}
      <Parties character={character} setCharacter={setCharacter} />
      {!CS.isMook(character) && (
        <Sites character={character} setCharacter={setCharacter} />
      )}
    </Box>
  )
}
