"use client"

import type { Character } from "@/types"
import { Icon, InfoLink, ListManager } from "@/components/ui"

type WeaponsProperties = {
  character: Pick<Character, "id" | "user" | "weapon_ids">
  updateCharacter: (character: Character) => void
}

export default function Weapons({
  character,
  updateCharacter,
}: WeaponsProperties) {
  return (
    <ListManager
      icon={<Icon keyword="Weapons" />}
      entity={character}
      name="weapons"
      title="Weapons"
      description={
        <>
          <InfoLink href="/weapons" info="Weapons" /> have stats listed in the{" "}
          form of (<InfoLink info="Damage" />/<InfoLink info="Concealment" />/
          <InfoLink info="Reload" />
          ). For Concealment and Reload, lower is better. You don&rsquo;t need
          to be told that for Damage, higher is best! 7 Damage is the lowest, 9
          is average, and 12 and above is getting serious.
        </>
      }
      updateEntity={updateCharacter}
      collection="weapons"
      collection_ids="weapon_ids"
      manage={true}
    />
  )
}
