"use client"

import { Box } from "@mui/material"
import { VscGithubAction } from "react-icons/vsc"
import type { Character } from "@/types"
import { InfoLink } from "@/components/links"
import { SchtickManager } from "@/components/schticks"

type SchticksProperties = {
  character: Pick<Character, "id" | "user" | "schtick_ids">
  setCharacter: (character: Character) => void
}

export default function Schticks({
  character,
  setCharacter,
  updateCharacter,
}: SchticksProperties) {
  const iconBox = (
    <Box sx={{ pt: 1, fontSize: "1.4rem" }}>
      <VscGithubAction />
    </Box>
  )
  return (
    <SchtickManager
      icon={iconBox}
      name="character"
      title="Schticks"
      description={
        <>
          <InfoLink href="/schticks" info="Schticks" /> are special abilities or
          powers, such as <InfoLink info="Martial Arts" /> techniques or{" "}
          <InfoLink info="Magic" /> spells.
        </>
      }
      entity={character}
      update={updateCharacter}
      setEntity={setCharacter}
    />
  )
}
