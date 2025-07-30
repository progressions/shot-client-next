import type { Weapon } from "@/types"

const WeaponService = {
  nameWithCategory: function (weapon: Weapon) {
    if (!weapon.category) {
      return <strong>{weapon.name}</strong>
    }
    return (
      <>
        <strong>{weapon.name}</strong> <em>{weapon.category}</em>
      </>
    )
  },

  stats: function (weapon: Weapon) {
    return `(${weapon.damage || "-"}/${weapon.concealment || "-"}/${weapon.reload_value || "-"})`
  },
}

export default WeaponService
