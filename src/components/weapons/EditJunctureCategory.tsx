"use client"

import { FormControl, FormHelperText, Stack } from "@mui/material"
import { Icon, InfoLink, SectionHeader } from "@/components/ui"
import {
  WeaponCategoryAutocomplete,
  WeaponJunctureAutocomplete,
} from "@/components/autocomplete"
import type { Weapon } from "@/types"
import { useState } from "react"
import type { FormStateType } from "@/reducers"

type EditJunctureCategoryProps = {
  weapon: Weapon
  updateWeapon: (weapon: Weapon) => Promise<void>
  state: FormStateType<Weapon>
}

export default function EditJunctureCategory({
  weapon,
  updateWeapon,
  state,
}: EditJunctureCategoryProps) {
  const { saving, errors } = state

  const [juncture, setJuncture] = useState<string | null>(
    weapon.juncture || null
  )
  const [category, setCategory] = useState<string | null>(
    weapon.category || null
  )

  const handleJunctureChange = async (value: string | null) => {
    setJuncture(value)
    await updateWeapon({ ...weapon, juncture: value })
  }

  const handleCategoryChange = async (value: string | null) => {
    setCategory(value)
    await updateWeapon({ ...weapon, category: value })
  }

  return (
    <>
      <SectionHeader
        title="Juncture and Category"
        icon={<Icon keyword="Juncture" />}
      >
        A <InfoLink href="/weapons" info="Weapon" /> belongs to a certain{" "}
        <InfoLink info="Juncture" /> and <InfoLink info="Category" />, which
        governs the style of the Weapon and where it&rsquo;s available.
      </SectionHeader>
      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <FormControl fullWidth margin="normal" error={!!errors.juncture}>
          <WeaponJunctureAutocomplete
            value={juncture || ""}
            onChange={handleJunctureChange}
            allowNone={false}
            disabled={saving}
          />
          {errors.juncture && (
            <FormHelperText>{errors.juncture}</FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!errors.category}>
          <WeaponCategoryAutocomplete
            value={category || ""}
            onChange={handleCategoryChange}
            allowNone={false}
            disabled={saving}
          />
          {errors.category && (
            <FormHelperText>{errors.category}</FormHelperText>
          )}
        </FormControl>
      </Stack>
    </>
  )
}
