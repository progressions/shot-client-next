"use client"

import type { Character } from "@/types"
import { Icon, InfoLink, Manager } from "@/components/ui"

type WeaponsProperties = {
  character: Pick<Character, "id" | "user" | "weapon_ids">
  updateCharacter: (character: Character) => void
  manage?: boolean
}

export default function Weapons({
  character,
  updateCharacter,
  manage = true,
}: WeaponsProperties) {
  return (
    <Manager
      icon={<Icon keyword="Weapons" />}
      parentEntity={character}
      childEntityName="Weapon"
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
      onListUpdate={updateCharacter}
      manage={manage}
    />
  )
}
