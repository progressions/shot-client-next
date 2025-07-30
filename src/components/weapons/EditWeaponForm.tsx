"use client"

import { useClient } from "@/contexts"
import { type Weapon } from "@/types"
import WeaponForm from "./WeaponForm"

interface EditWeaponFormProperties {
  open: boolean
  onClose: () => void
  onSave: (updatedWeapon: Weapon) => void
  weapon: Weapon
}

export default function EditWeaponForm({
  open,
  onClose,
  onSave,
  weapon,
}: EditWeaponFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, weaponData: Weapon) => {
    const updatedWeaponData = {
      ...weapon,
      ...weaponData,
    } as Weapon
    formData.set("weapon", JSON.stringify(updatedWeaponData))
    const response = await client.updateWeapon(weapon.id, formData)
    onSave(response.data)
  }

  return (
    <WeaponForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...weapon, image: null }}
      title="Edit Weapon"
      existingImageUrl={weapon.image_url}
    />
  )
}
