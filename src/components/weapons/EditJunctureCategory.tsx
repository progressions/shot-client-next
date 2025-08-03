"use client"

import { FaRegCalendarAlt } from "react-icons/fa"
import { Stack } from "@mui/material"
import { SectionHeader } from "@/components/ui"
import { InfoLink } from "@/components/links"
import {
  WeaponCategoryAutocomplete,
  WeaponJunctureAutocomplete,
} from "@/components/autocomplete"
import type { Weapon } from "@/types"
import { useState } from "react"

type EditJunctureCategoryProps = {
  weapon: Weapon
  updateWeapon: (weapon: Weapon) => Promise<void>
}

export default function EditJunctureCategory({
  weapon,
  updateWeapon,
}: EditJunctureCategoryProps) {
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
        icon={<FaRegCalendarAlt size="24" />}
      >
        A <InfoLink href="/weapons" info="Weapon" /> belongs to a certain{" "}
        <InfoLink info="Juncture" /> and <InfoLink info="Category" />, which
        governs the style of the Weapon and where it&rsquo;s available.
      </SectionHeader>
      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <WeaponJunctureAutocomplete
          value={juncture || ""}
          onChange={handleJunctureChange}
          allowNone={false}
        />
        <WeaponCategoryAutocomplete
          value={category || ""}
          onChange={handleCategoryChange}
          allowNone={false}
        />
      </Stack>
    </>
  )
}
