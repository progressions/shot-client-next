"use client"

import { FaGun } from "react-icons/fa6"
import { Box } from "@mui/material"
import type { Character } from "@/types"
import { InfoLink } from "@/components/links"
import { WeaponManager } from "@/components/weapons"

type WeaponsProperties = {
  character: Pick<Character, "id" | "user" | "weapon_ids">
  setCharacter: (character: Character) => void
}

export default function Weapons({
  character,
  setCharacter,
  updateCharacter,
}: WeaponsProperties) {
  const iconBox = (
    <Box sx={{ pt: 1, fontSize: "1.4rem" }}>
      <FaGun />
    </Box>
  )
  return (
    <WeaponManager
      icon={iconBox}
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
