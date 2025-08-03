"use client"

import type { Character } from "@/types"
import { InfoLink } from "@/components/links"
import { SchtickManager } from "@/components/schticks"
import { Icon } from "@/lib"

type SchticksProperties = {
  character: Pick<Character, "id" | "user" | "schtick_ids">
  setCharacter: (character: Character) => void
}

export default function Schticks({
  character,
  setCharacter,
  updateCharacter,
}: SchticksProperties) {
  return (
    <SchtickManager
      icon={<Icon keyword="Schticks" />}
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
