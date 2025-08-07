"use client"

import type { Character } from "@/types"
import { Icon, InfoLink, ListManager } from "@/components/ui"

type SchticksProperties = {
  character: Character
  updateCharacter: (character: Character) => void
}

export default function Schticks({
  character,
  updateCharacter,
}: SchticksProperties) {
  return (
    <ListManager
      icon={<Icon keyword="Schticks" />}
      parent={character}
      name="schticks"
      title="Schticks"
      description={
        <>
          <InfoLink href="/schticks" info="Schticks" /> are special abilities or
          powers, such as <InfoLink info="Martial Arts" /> techniques or{" "}
          <InfoLink info="Magic" /> spells.
        </>
      }
      updateParent={updateCharacter}
      collectionName="schticks"
      collection_ids="schtick_ids"
      manage={true}
    />
  )
}
