import Link from "next/link"
import type { Weapon } from "@/types/types"
import { WeaponName } from "@/components/weapons"

type WeaponLinkProps = {
  weapon: Weapon
}

export default function WeaponLink({ weapon }: WeaponLinkProps) {
  return (<>
    <Link
      href={`/weapons/${weapon.id}`}
      data-mention-id={weapon.id}
      data-mention-class-name="Weapon"
      style={{textDecoration: "underline", color: "#fff"}}
    >
      <WeaponName weapon={weapon} />
    </Link>
    {' '}
    ({weapon.damage}/{weapon.concealment || "-"}/{weapon.reload_value || "-"})
  </>)
}
