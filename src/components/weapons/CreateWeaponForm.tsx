"use client"

import { defaultWeapon, type Weapon } from "@/types"
import { useClient } from "@/contexts"
import WeaponForm from "./WeaponForm"

interface CreateWeaponFormProps {
  open: boolean
  onClose: () => void
  onSave: (newWeapon: Weapon) => void
}

export default function CreateWeaponForm({ open, onClose, onSave }: CreateWeaponFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, weaponData: Weapon) => {
    const weapon = { ...defaultWeapon, ...weaponData } as Weapon
    formData.set("weapon", JSON.stringify(weapon))
    const response = await client.createWeapon(formData)
    onSave(response.data)
  }

  return (
    <WeaponForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultWeapon, image: null }}
      title="New Weapon"
    />
  )
}

