"use client"

import type { Character } from "@/types"
import { InfoLink } from "@/components/links"
import { WeaponManager } from "@/components/weapons"
import { Icon } from "@/lib"

type WeaponsProperties = {
  character: Pick<Character, "id" | "user" | "weapon_ids">
  setCharacter: (character: Character) => void
}

export default function Weapons({
  character,
  setCharacter,
  updateCharacter,
}: WeaponsProperties) {
  return (
    <WeaponManager
      icon={<Icon keyword="Weapons" />}
      name="character"
      title="Weapons"
      description={
        <>
          <InfoLink href="/weapons" info="Weapons" /> are special abilities or
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
