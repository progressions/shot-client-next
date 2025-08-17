"use client"

import WeaponForm from "./WeaponForm"

interface CreateWeaponFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreateWeaponForm({
  open,
  onClose,
}: CreateWeaponFormProperties) {
  return (
    <WeaponForm
      open={open}
      onClose={onClose}
      title="New Weapon"
    />
  )
}
