"use client"

import { useClient } from "@/contexts"
import { type Weapon } from "@/types/types"
import WeaponForm from "./WeaponForm"

interface EditWeaponFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedWeapon: Weapon) => void
  weapon: Weapon
}

export default function EditWeaponForm({ open, onClose, onSave, weapon }: EditWeaponFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, weaponData: Weapon) => {
    const updatedWeaponData = {
      ...weapon,
      id: weapon.id,
      name: weaponData.name,
      damage: weaponData.damage,
      description: weaponData.description,
    } as Weapon
    formData.set("weapon", JSON.stringify(updatedWeaponData))
    const response = await client.updateWeapon(weapon.id as string, formData)
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

