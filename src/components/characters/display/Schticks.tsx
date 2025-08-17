"use client"

import type { Character } from "@/types"
import { Icon, InfoLink, Manager } from "@/components/ui"

type SchticksProperties = {
  character: Character
  updateCharacter: (character: Character) => void
}

export default function Schticks({
  character,
  updateCharacter,
  manage = true,
}: SchticksProperties) {
  return (
    <Manager
      icon={<Icon keyword="Schticks" />}
      parentEntity={character}
      childEntityName="Schtick"
      title="Schticks"
      description={
        <>
          <InfoLink href="/schticks" info="Schticks" /> are special abilities or
          powers, such as <InfoLink info="Martial Arts" /> techniques or{" "}
          <InfoLink info="Magic" /> spells.
        </>
      }
      onListUpdate={updateCharacter}
      manage={manage}
      excludeIds={character.schtick_ids || []}
    />
  )
}
