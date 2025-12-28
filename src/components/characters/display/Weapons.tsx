"use client"

import { useCallback } from "react"
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import type { Character } from "@/types"
import { Icon, InfoLink, Manager, SectionHeader } from "@/components/ui"
import { useClient, useToast } from "@/contexts"

type WeaponsProperties = {
  character: Pick<
    Character,
    "id" | "user" | "weapon_ids" | "weapons" | "equipped_weapon_id"
  >
  updateCharacter: (character: Character) => void
  manage?: boolean
}

export default function Weapons({
  character,
  updateCharacter,
  manage = true,
}: WeaponsProperties) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  // Use weapons directly from character - WebSocket broadcasts include weapons
  const weapons = character.weapons || []

  const handleEquipWeapon = useCallback(
    async (weaponId: string | null) => {
      try {
        const formData = new FormData()
        formData.append("character[equipped_weapon_id]", weaponId || "")
        const response = await client.updateCharacter(character.id, formData)
        updateCharacter(response.data)
        toastSuccess(
          weaponId ? "Weapon equipped successfully" : "Weapon unequipped"
        )
      } catch {
        toastError("Failed to update equipped weapon")
      }
    },
    [client, character.id, updateCharacter, toastSuccess, toastError]
  )

  return (
    <>
      {/* Equipped Weapon Section */}
      <Box sx={{ my: 4 }}>
        <SectionHeader
          title="Equipped Weapon"
          icon={<Icon keyword="Weapons" />}
          sx={{ width: "100%", mb: 2 }}
        >
          The weapon your character currently has at the ready. This will be
          pre-selected during combat.
        </SectionHeader>
        <FormControl fullWidth size="small">
          <InputLabel>Equipped Weapon</InputLabel>
          <Select
            value={character.equipped_weapon_id || ""}
            label="Equipped Weapon"
            onChange={e => handleEquipWeapon(e.target.value || null)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {weapons.map(weapon => (
              <MenuItem key={weapon.id} value={weapon.id}>
                {weapon.name} ({weapon.damage}/{weapon.concealment || "-"}/
                {weapon.reload_value || "-"})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Weapons List Manager */}
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
            to be told that for Damage, higher is best! 7 Damage is the lowest,
            9 is average, and 12 and above is getting serious.
          </>
        }
        onListUpdate={updateCharacter}
        manage={manage}
      />
    </>
  )
}
