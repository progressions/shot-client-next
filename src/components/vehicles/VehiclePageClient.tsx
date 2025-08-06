"use client"

import type { Character } from "@/types"
import { useClient, useCampaign } from "@/contexts"
import { useState, useEffect } from "react"
import { Box, Stack } from "@mui/material"
import { CS } from "@/services"
import { Icon, SectionHeader } from "@/components/ui"
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
  CharacterSpeedDial,
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
      <SectionHeader
        title="Action Values"
        icon={<Icon keyword="Action Values" />}
      >
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
          <SectionHeader
            title="Personal Details"
            icon={<Icon keyword="Personal Details" />}
          >
            Personal details about your character, such as their type,
            archetype, juncture, and wealth.
          </SectionHeader>
          <Associations character={character} />

          <SectionHeader title="Skills" icon={<Icon keyword="Skills" />}>
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
      <Sites character={character} setCharacter={setCharacter} />
    </Box>
  )
}
