"use client"

import { defaultWeapon, type Weapon } from "@/types"
import { useClient } from "@/contexts"
import WeaponForm from "./WeaponForm"

interface CreateWeaponFormProperties {
  open: boolean
  onClose: () => void
  onSave: (newWeapon: Weapon) => void
}

export default function CreateWeaponForm({
  open,
  onClose,
  onSave,
}: CreateWeaponFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, weaponData: Weapon) => {
    const weapon = { ...defaultWeapon, ...weaponData } as Weapon
    formData.set("weapon", JSON.stringify(weapon))
    const response = await client.createWeapon(formData)
    onSave(response.data)
  }

  const defaultEntity = defaultWeapon

  return (
    <WeaponForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultEntity, image: null }}
      title="New Weapon"
    />
  )
}
